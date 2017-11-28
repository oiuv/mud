
inherit ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
这条山路盘终南山主峰而上，山路贴着石璧凿出，只容一
人可过，形势极为险峻。往远处望去。但见群山环绕，列於脚
下，百里美景尽收眼底，顿时令人豪气陡声，往北下是一条山
路。往东上就是终南山主峰。
LONG
        );
        set("outdoors", "quanzhen");
        set("exits", ([
                "northdown" : __DIR__"shanlu3",
                "eastup"    : __DIR__"zhufeng",
        ]));

        setup();
        replace_program(ROOM);
}
