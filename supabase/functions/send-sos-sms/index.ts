import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SOSRequest {
  latitude: number;
  longitude: number;
  mapsLink: string;
  contacts: Array<{
    name: string;
    phone_number: string;
  }>;
  userName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("Auth error:", claimsError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get Twilio credentials
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhone = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !twilioPhone) {
      console.error("Missing Twilio credentials");
      return new Response(
        JSON.stringify({ error: "SMS service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { latitude, longitude, mapsLink, contacts, userName }: SOSRequest = await req.json();

    if (!contacts || contacts.length === 0) {
      return new Response(
        JSON.stringify({ error: "No contacts provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending SOS to ${contacts.length} contacts`);

    // Construct the emergency message
    const message = `🚨 EMERGENCY ALERT 🚨\n\n${userName || "Someone"} needs help!\n\nLocation: ${mapsLink}\n\nCoordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}\n\nPlease respond immediately or call emergency services.`;

    // Send WhatsApp messages to all contacts
    const sendPromises = contacts.map(async (contact) => {
      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        
        // Format phone number for WhatsApp (add whatsapp: prefix)
        const whatsappTo = `whatsapp:${contact.phone_number}`;
        const whatsappFrom = `whatsapp:${twilioPhone}`;
        
        const formData = new URLSearchParams();
        formData.append("To", whatsappTo);
        formData.append("From", whatsappFrom);
        formData.append("Body", message);

        const response = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${btoa(`${accountSid}:${authToken}`)}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        });

        const result = await response.json();
        
        if (!response.ok) {
          console.error(`Failed to send to ${contact.name}:`, result);
          return { contact: contact.name, success: false, error: result.message };
        }

        console.log(`SMS sent to ${contact.name}: ${result.sid}`);
        return { contact: contact.name, success: true, sid: result.sid };
      } catch (error) {
        console.error(`Error sending to ${contact.name}:`, error);
        return { contact: contact.name, success: false, error: String(error) };
      }
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.filter((r) => !r.success).length;

    console.log(`SOS complete: ${successCount} sent, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        failed: failedCount,
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-sos-sms function:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
