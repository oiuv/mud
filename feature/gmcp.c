#define GMCP_LOG 50
protected int dump_gmcp_log();

#ifdef GMCP_LOG
nosave string *gmcp_log = ({});
#endif

private void log_gmcp(string msg)
{
#ifdef GMCP_LOG
    gmcp_log = gmcp_log[ < GMCP_LOG..] + ({msg});
#endif
}

// gmcp - provides an interface to GMCP data received from the client
void gmcp(string req)
{
    log_gmcp("Received: " + req);
    // debug_message(req);
}

void gmcp_enable()
{
    message("system", "<GMCP negotiation enabled>\n\n", this_object());
}

private varargs void send_gmcp(string package, string message, mixed *data...)
{
    // string pkg = lower_case(package);
    string msg = package + "." + message;
    if (sizeof(data) && this_player())
    {
        catch (msg += " " + json_encode(data[0]));
        log_gmcp("Sending: " + msg);
        efun::send_gmcp(msg);
    }
}

protected void init_gmcp()
{
    if (this_player() && !has_gmcp(this_player()))
        return;
    send_gmcp("core", "hello", (["mud_name" : MUD_NAME]));
    gmcp_enable();
    add_action("dump_gmcp_log", "gmcp_log");
}

#ifdef GMCP_LOG
protected int dump_gmcp_log()
{
    write(implode(gmcp_log, "\n") + "\n");
    return 1;
}
#endif

varargs void process_gmcp(mapping attributes, string package, string message)
{
    if (!package || !message)
    {
        // log_gmcp("Returning: " + package + "." + message);
        return;
    }
    // log_gmcp("Process: " + package + "." + message);
    if (mapp(attributes))
        send_gmcp(package, message, attributes);
}
