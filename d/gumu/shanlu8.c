
inherit ROOM;

void create()
{
        set("short", "山道");
        set("long", @LONG
此段山路是沿着峭壁开凿出来的，特别崎岖难行。有时峭
壁边必须面贴山璧，侧身而过。尤其当山凤吹来之时，更需特
别小心，不然一失足，就要掉进万丈深渊了。往北是一块广大
的空地。往南下是一块巨岩。
LONG
        );
        set("outdoors", "quanzhen");
        set("exits", ([
                "northup"    : __DIR__"daxiaochang",
                "southdown"  : __DIR__"juyan",
        ]));

        setup();
        replace_program(ROOM);
}
