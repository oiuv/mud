inherit ROOM;

void create()
{
        set("short", "牟尼堂");
        set("long",@LONG
这是高僧们的静修之处。整堂全以松木制成，板门木柱，木料均不去
皮，天然质朴，和一路行来金碧辉煌的殿堂截然不同。
LONG
        );
        set("exits", ([
		"north": __DIR__"banruotai",
	]));
	set("objects",([
		CLASS_D("tianlongsi") + "/kurong"   : 1,
		CLASS_D("tianlongsi") + "/benguan"  : 1,
		CLASS_D("tianlongsi") + "/benxiang" : 1,
		CLASS_D("tianlongsi") + "/bencan"   : 1,
		CLASS_D("tianlongsi") + "/benyin"   : 1,
        ]));
        setup();
}

void init()
{
        add_action("do_quit", "quit");
        add_action("do_exit", "exit");
}

string long()
{
        if (mapp(query("exits")))
                return query("long");

        return query("long") + "    现在室内剑气纵横，你来"
               "我往，杀个不停。\n";
}

int do_quit()
{
        object me;

        me = this_player();
        if (! mapp(query("exits")))
        {
                write("现在没有出路，你无法离开。\n");
                return 1;
        }

        return 0;
}
