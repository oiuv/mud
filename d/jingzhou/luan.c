inherit ROOM;

void create()
{
	set("short", "乱坟岗");
	set("long", @LONG
这里是一处乱坟岗，到处长满了过人高的长草，听说经常
闹鬼，所以没人敢来。一阵冷风刮来，吓的你根根体毛竖起。
LONG);

	set("exits", ([
		"westup" : __DIR__"xiaoshan",
		"east" : __DIR__"luan2",
	]));
        set("no_clean_up", 0);
        set("outdoors", "jingzhou");

        setup();
        replace_program(ROOM);
}
