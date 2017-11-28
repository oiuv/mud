inherit ROOM;

void create()
{
        set("short", "书房");
        set("long", @LONG
这是绝情谷的书房，但见四周整齐地摆放着各种书籍。书
房中央有一个雕有花纹的书桌和一张精致的木椅。
LONG);
        set("exits", ([
               "east"    : __DIR__"changlang1",
               "north"   : __DIR__"huohuanshi",
        ]));

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
