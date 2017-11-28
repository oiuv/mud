
inherit ROOM;

void create()
{
        set("short", "道路");
        set("long", @LONG
此处位於终南山山脚。巍峨的终南山，自古以来就是历代
名人游览的圣地。它西起甘肃的岐山，东至陕西的潼关，其间
跨越十馀县，连绵八百馀里。素有万里终南山之称。往东可看
见一座寺庙。往西是一条通往密林的幽静小路。往北可上终南
山。
LONG
        );
        set("outdoors", "quanzhen");
        set("exits", ([
                "northup"   : __DIR__"shanlu12",
                "east"      : __DIR__"puguangsi",
                "west"      : __DIR__"shanlu14",
                "south"     : "/d/quanzhen/shanjiao",
        ]));

        setup();
        replace_program(ROOM);
}
