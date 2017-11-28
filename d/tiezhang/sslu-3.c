inherit ROOM;

void create()
{
        set("short", "碎石路");
        set("long", @LONG
你走在一条用碎石铺成的小路上。两旁山势低缓，长满了翠绿的毛竹，
阵阵微风吹过，耳旁便响起一片沙沙声。
LONG    );

        set("exits", ([
               "westdown" : __DIR__"sslu-2",
               "northup" : __DIR__"mzfeng",
        ]));

        set("no_clean_up", 0);
        set("outdoors", "tiezhang");

        setup();
        replace_program(ROOM);
}
