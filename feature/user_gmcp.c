#define GMCP_LOG 50

nosave string *gmcp_log = ({});

// msp_oob("!!SOUND(10001.wav L=1 V=100 U=https://mud.ren/storage/wav/)");
void msp_oob(string req)
{
#if efun_defined(telnet_msp_oob)
    efun::telnet_msp_oob(req);
#else
    receive("<当前驱动不支持efun telnet_msp_oob()>\n");
#endif
}

protected int dump_gmcp_log()
{
    write(implode(gmcp_log, "\n") + "\n");
    return 1;
}

private void log_gmcp(string msg)
{
    gmcp_log = gmcp_log[ < GMCP_LOG..] + ({msg});
}

void send_gmcp(string gmcp)
{
    efun::send_gmcp(gmcp);
}

varargs void sendGMCP(mapping data, mixed *modules...)
{
    if (!has_gmcp())
        return;

    if (!mapp(data) || !sizeof(modules))
    {
        return;
    }
    else
    {
        string msg = implode(modules, ".");
        catch (msg += " " + json_encode(data));
        log_gmcp("Sending: " + msg);
        send_gmcp(msg);
    }
}

private void gmcp_enable()
{
    message("system", "<GMCP negotiation enabled>\n", this_object());
    sendGMCP((["mud_name":MUD_NAME]), "Core", "Hello");
}

protected void init_gmcp()
{
    if (!has_gmcp())
        return;
    gmcp_enable();

    // Mudlet Client
    if (env("GUI"))
    {
        sendGMCP((["version":env("GUI.version"), "url":env("GUI.url")]), "Client", "GUI");
    }
    if (sizeof(env("Map")))
    {
        sendGMCP((["url":env("Map")]), "Client", "Map");
    }

    if (wizardp(this_player()))
    {
        add_action("dump_gmcp_log", "gmcp_log");
    }
}

// gmcp - provides an interface to GMCP data received from the client
void gmcp(string req)
{
    log_gmcp("Received: " + req);
    // todo 处理客户端请求
    if (req == "Char.Vitals.Get")
    {
        object ob = this_object();
        mapping my = ob->query_entire_dbase() || ([]);
        // 很奇怪的问题, 得加` || 0`, 否则对0值客户端可能是<userdata 1>
        mapping data = ([
            "hp"         : my["qi"] || 0,
            "max_hp"     : my["max_qi"] || 0,
            "jing"       : my["jing"] || 0,
            "max_jing"   : my["max_jing"] || 0,
            "jingli"     : my["jingli"] || 0,
            "max_jingli" : my["max_jingli"] || 0,
            "neili"      : my["neili"] || 0,
            "max_neili"  : my["max_neili"] || 0,
            "food"       : my["food"] || 0,
            "max_food"   : ob->max_food_capacity(),
            "water"      : my["water"] || 0,
            "max_water"  : ob->max_water_capacity(),
            "exp"        : my["combat_exp"] || 0,
            "pot"        : (int)ob->query("potential") - (int)ob->query("learned_points"),
        ]);
        sendGMCP(data, "Char", "Vitals");
    }
    else if (req == "Room.Info.Get")
    {
        object ob = environment(this_object());
        mapping room_info = ([
            "name" : remove_ansi(ob->query("short") || ob->query("name") || ""),
            "exits": keys(ob->query("exits") || ([])),
            "area" : ob->query("outdoors") || explode(base_name(ob), "/")[1],
            "hash" : hash("md5", base_name(ob))
        ]);
        sendGMCP(room_info, "Room", "Info");
        // 音效示例
        if (room_info["name"] == "树林")
        {
            msp_oob("!!SOUND(10001.wav L=1 V=100 U=https://mud.ren/storage/wav/)");
        }
        else
        {
            msp_oob("!!SOUND(Off)");
        }
    }
}
