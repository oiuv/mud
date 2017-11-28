// shanlu5.c
// Date: Nov.1997 by Venus

inherit BUILD_ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
走在小路上，只见漫山遍野都是绿油油的茶蓬。农家少女们在欢
笑声中采茶，到此不由得尽忘江湖仇杀，只想久居此地。。山路延伸
向东西两边，北边就是龙井，东北边有一条土路。
LONG);
        set("exits", ([
                "westup"   : __DIR__"shanlu4",
                "northeast": __DIR__"tulu1",
                "north"    : __DIR__"longjing",
                "east"     : __DIR__"yanxiadong",
        ]));
        set("objects", ([
                __DIR__"npc/caichanu" :2,
        ]));
        set("outdoors", "hangzhou");
        set("max_room", 4);
        setup();
        replace_program(ROOM);
}
