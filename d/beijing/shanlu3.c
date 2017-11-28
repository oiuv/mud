
inherit ROOM;

void create()
{
	set("short", "山路");
	set("long", "这里是山中的一片丛林，灌木中夹杂着一些野花，被高"
                    "大的树木遮住\n了阳光。一块巨大的石头倚树而卧。\n");
	set("exits", ([
		"eastdown" : __DIR__"shanlu2",
	]));
 	set("outdoors", "beijing");
	setup();
        (CLASS_D("ultra") + "/kuihua")->come_here();
        replace_program(ROOM);
}

string long()
{
        object ob;
        string msg;

        msg = query("long");
        if (! objectp(ob = present("kuihua taijian", this_object())))
                return sort_string(msg, 64, 4);

        if (! ob->is_fighting())
                msg += "有一个黄衫人靠在石上，痴痴的望着远方，一动不动"
                       "的，也不知道他在这里究竟待了多久。";
        else
                msg += "只见一黄衫人身形诡秘，进退疾若闪电，正在与" +
                       (ob->is_fighting(this_player()) ? "你" : "人") +
                       "激战。";

        return sort_string(msg, 64, 4);
}

