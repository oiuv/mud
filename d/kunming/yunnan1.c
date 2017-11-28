inherit ROOM;

void create()
{
        set("short", "红土路");
        set("long", @LONG
进入云贵高原，泥土变为了红色，空气变得更清新，放眼
看去，只见周围那绵绵的原始森林不见边际，你顿时觉得心高
志远，一股豪气涌了上来，想要做一番大事业。
LONG);
        set("outdoors", "kunming");
        set("exits", ([
                "south" : __DIR__"yunnan2", 
                "northeast"  :__DIR__"yunnan",
        ]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
