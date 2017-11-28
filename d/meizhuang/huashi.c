// huashi.c
inherit ROOM;

void create()
{
        set("short", "画室");
        set("long", @LONG
这里是丹青生的画室，俗话说：书画不分家，所以丹青生的书法
也有相当的功力，虽然不及他三哥秃笔翁很多，但他将他的剑法融于
他的书法当中，也可谓是银钩铁画了。这里的陈设和书室差不多，唯
一不同的是这里的墙上并没有挂丹青生的丹青妙笔，而是挂了许多前
朝名家的名画，属于丹青生自己的是一幅写着《兵车行》的中堂。
LONG
        );
        set("exits", ([
                "west" : __DIR__"zoulang1",
        ]));

        set("objects", ([
                CLASS_D("meizhuang") + "/danqing" : 1,
        ]));

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}