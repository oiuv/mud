
inherit ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
这条山路盘终南山主峰而上，山路贴着石璧凿出，只容一
人可过，形势极为险峻。往远处望去。但见群山环绕，列於脚
下，百里美景尽收眼底，顿时令人豪气陡声，往南下和西上各
是一条山路。
LONG
        );
        set("outdoors", "quanzhen");
        set("exits", ([
                "westup"     : __DIR__"shanlu4",
                "southdown"  : __DIR__"shanlu6",
        ]));

        setup();
        replace_program(ROOM);
}
