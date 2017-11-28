inherit ROOM;

void create()
{
        set("short", "中院");
        set("long", @LONG
中院分为前后两部分，院子的正中有座铁制浮屠，高七层。
雕刻精美花纹。前边部分除中间的行道外，两边是花圃，各种
一棵高大的菩提树。后边铺着青石，通向大雄宝殿。南边是天
王殿，东边是素斋厨，西面是浴室。
LONG
        );
        set("objects", ([
  		__DIR__"npc/obj/tiefutu" : 1,
	]));
        set("no_clean_up", 0);
        set("exits", ([
  		"south" : __DIR__"tianwang",
  		"north" : __DIR__"daxiong",
  		"east" : __DIR__"chufang",
  		"west" : __DIR__"yushi",
	]));
        set("outdoors", "kaifeng");

        setup();
        replace_program(ROOM);
}
