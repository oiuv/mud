#include <ansi.h> 
inherit ROOM;

void create()
{
	set("short", "商家堡大厅");
	set("long", @LONG
这里是商家堡的大厅，大厅内很是宽敞明亮，地上刻有一个
巨大的铁八卦。正对厅门摆放着一张八仙桌，一人压座中堂，身
材高大魁梧，留着短须，神情甚为严肃，正是「八卦刀」商剑鸣。
LONG);
	set("exits", ([
		"north"  : __DIR__"shang_houting",
		"south"  : __DIR__"shang_xiaojin2",
		"east"  : __DIR__"shang_tinge",
		"west"  : __DIR__"shang_tingw",
	]));
        set("objects", ([
                CLASS_D("shang") + "/ming" : 1,
        ]));
        set("no_clean_up", 0);
        set("valid_startroom", 1);
        setup();
        "/clone/board/shang_b"->foo();
}


int valid_leave(object me, string dir)
{
//      int i;
//      object ob;
        me = this_player();

        if (dir == "north" || 
           dir == "east" || 
           dir == "west")
        {
                if ((string)me->query("family/family_name") != "商家堡" &&
                   (string)me->query("born_family") != "山东商家" &&
                   objectp(present("shang jianming", environment(me))))
                        return notify_fail(CYN "商剑鸣对你喝道：什么东西，居然"
                                           "敢在我面前放肆！\n" NOR);
        }
        return ::valid_leave(me, dir);
}