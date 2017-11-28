inherit ROOM;

void create()
{
        set("short", "剑川镇");
        set("long", @LONG
这里是剑川的镇中心，镇子不大，居民绝大部分是乌夷族
几乎全都以狩猎为生。由于山高地寒，附近山林的野兽大多皮
粗毛厚，有不少皮货商在这里和当地猎人交易。北出山口则属
大理北疆，也是入蜀之途，南穿苍山则可抵大理内陆。
LONG);
        set("objects", ([
                __DIR__"npc/lieren" : 1,
                __DIR__"npc/pihuoshang": 1,
        ]));
        set("outdoors", "dali");
        set("exits", ([
                "north" : __DIR__"jianchuankou",
                "south" : __DIR__"cangshanzhong",
        ]));
        setup();
        replace_program(ROOM);
}
