#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "庭院");
        set("long", @LONG
这里是万安寺的大院，打扫得非常干净。大院两旁是几间大屋，全以松木搭
成，极大的木柱，木料均不去皮，天然质朴，却与大院正对的一座金碧辉煌的殿
堂截然不同。
LONG );
        set("exits", ([
                "out" : "/d/tulong/yitian/was_damen",
                "east" : "/d/tulong/yitian/was_change",
                "west" : "/d/tulong/yitian/was_changw",
                "north" : "/d/tulong/yitian/was_zoulang1",
        ]));

        set("objects", ([
                "/d/tulong/yitian/npc/zhao1" : 1,
                "/d/tulong/yitian/npc/qian2" : 1,
                "/d/tulong/yitian/npc/sun3" : 1,
                "/d/tulong/yitian/npc/li4" : 1,
                "/d/tulong/yitian/npc/zhou5" : 1,
                "/d/tulong/yitian/npc/wu6" : 1,
                "/d/tulong/yitian/npc/zheng7" : 1,
                "/d/tulong/yitian/npc/wang8" : 1,
        ]));

        setup();
}

int valid_leave(object me,string dir)
{
        object ob;

        if ( dir == "north" && ob = present("zhao yishang"))
        {
                message_vision(CYN "$N喝道：在这里也敢乱闯？去死吧！\n" NOR,ob,me);
                ob->kill_ob(me);
                ob = present("qian erbai");
                if (objectp(ob)) ob->kill_ob(me);
                ob = present("sun sanhui");
                if (objectp(ob)) ob->kill_ob(me);
                ob = present("li sicui");
                if (objectp(ob)) ob->kill_ob(me);
                ob = present("zhou wushu");
                if (objectp(ob)) ob->kill_ob(me);
                ob = present("wu liupo");
                if (objectp(ob)) ob->kill_ob(me);
                ob = present("zheng qimie");
                if (objectp(ob)) ob->kill_ob(me);
                ob = present("wang bashuai");
                if (objectp(ob)) ob->kill_ob(me);
                return notify_fail("向北的路被神箭八雄拦住了。\n");
        }
        return 1;
}

