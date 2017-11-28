inherit ROOM;

void create()
{
        set("short", "牌坊");
        set("long", @LONG
穿过一道照壁，走上一条青石小道，眼前不远就是一道牌
坊。通用红漆过了一边，看不出原来的底色，倒是跟关帝爷的
脸色很像，北面闹轰轰的是座戏楼，东面就是关帝庙。
LONG
        );
        set("outdoors", "kaifeng");
        set("exits", ([
  		"north" : __DIR__"xilou",
  		"east" : __DIR__"guandi",
  		"west" : __DIR__"huiguan",
	]));
        set("no_clean_up", 0);
        set("objects", ([
  		__DIR__"npc/huizhang" : 1,
  		__DIR__"npc/pihuoshang" : 1,
	]));

        setup();
        replace_program(ROOM);
}
