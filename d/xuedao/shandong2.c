inherit ROOM;

void create()
{
        set("short", "洞口");
        set("long", @LONG
山谷里积雪被拢成几个雪堆，这里时常有人扫除积雪。你
前面的峭壁下隐隐约约有一个山洞。南北两旁都是崖壁，东面
则是一处峭壁，非常险要。
LONG);
        set("exits", ([
                "enter" : __DIR__"shandong3",
                "west"  : __DIR__"sroad9",
        ]));
        set("objects", ([
                CLASS_D("xuedao") + "/baoxiang" : 1,
        ]));
        set("outdoors", "xuedao");
        setup();
}

int valid_leave(object me, string dir)
{
        object guarder;

        if (dir == "west" ||
            ! objectp(guarder = present("bao xiang", this_object())) ||
            ! living(guarder))
                return ::valid_leave(me, dir);

        return guarder->permit_pass(me, dir);
}
