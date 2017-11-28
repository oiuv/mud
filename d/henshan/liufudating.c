inherit ROOM;

void create()
{
        set("short", "刘府大厅");
        set("long", @LONG
刘府大厅里异常冷清。大厅正中放着一张茶几，上面铺了
锦缎。只见旁边一只金光灿烂、径长尺半的黄金盆子却被打翻
在地上。看来这里像是发生过打斗。
LONG);
        set("exits", ([
                "west"   : __DIR__"liufuwest",
                "east"   : __DIR__"liufueast",
                "south"  : __DIR__"liufudayuan",
        ]));

        setup();
	replace_program(ROOM);
}
