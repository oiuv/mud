inherit ROOM;

void create()
{
        set("short", "御街");
        set("long", @LONG
这条横贯南北的街道是皇上出巡时的要道，北起宣德门南
至南盈门，两边店铺不断。街道东面是有名的稻香居。
LONG);
        set("no_clean_up", 0);
        set("outdoors", "kaifeng");
        set("exits", ([
  		"north" : __DIR__"road3",
  		"west" : __DIR__"gongyuan3",
  		"south" : __DIR__"zhuque",
  		"east" : __DIR__"daoxiang",
	]));

        setup();
        replace_program(ROOM);
}