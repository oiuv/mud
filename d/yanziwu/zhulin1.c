//ROOM: /d/yanziwu/zhulin1.c

inherit ROOM;

void create()
{
        set("short", "竹林");
        set("long",@LONG
凤尾森森，龙吟细细，竿竿青竹纵横交错，遮蔽天日。这
里人迹罕至，微风拂过竹林，发出沙沙之声，你心中不免惴惴
不安起来。林中一道道石子铺成的羊肠小道向前延伸。
LONG );
        set("outdoors", "yanziwu");
        set("exits", ([
            "west" : __DIR__"cuixia",
            "east" : __DIR__"zhulin2",
            "north": __DIR__"zhulin4",
            "south": __DIR__"zhulin4",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
