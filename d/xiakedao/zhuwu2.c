// zhuwu.c

inherit ROOM;

void create()
{
        set("short", "竹屋");
        set("long",
                "这是竹屋内部，里面几乎没有什么摆设，倒是有一盏古灯燃着，映得"
                "旁边的一尊泥佛的影子不住的晃动。整个屋子布置得极其朴素，看来"
                "主人是能耐的清苦的人。");
        set("exits", ([
                "out" : __DIR__"zhuwu",
        ]));
        setup();
//        (CLASS_D("ultra") + "/shenni")->come_here();
}

string long()
{
        object ob;
        string msg;

        msg = query("long");
        if (! objectp(ob = present("nanhai shenni", this_object())))
                return sort_string(msg, 64, 4);

        if (! ob->is_fighting())
                msg += "一青衫老尼盘腿而坐，任由面前古灯闪烁，对"
                       "你的来到视若无物。";
        else
                msg += "只见一人正在与" +
                       (ob->is_fighting(this_player()) ? "你" : "人") +
                       "激战，层层气浪震得竹屋摇摇欲坠。";

        return sort_string(msg, 64, 4);
}
