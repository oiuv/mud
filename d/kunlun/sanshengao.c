inherit ROOM;

void create()
{
	set("short", "三圣坳");
        set("long", @long
但见遍地绿草如锦，到处果树香花。原来那三圣坳四周都
是插天高山，挡住了寒气。昆仑派历代掌门人曾花了极大力气
整顿这个山坳，派遣弟子东至江南，西至天竺，搬移奇花异树
前来种植。忽听得山坳后隐隐传出一阵琴声。
long);

	set("exits", ([
		"north" : __DIR__"jingshenfeng",
		"down" :  __DIR__"fufengshan",
	]));
        
        set("outdoors", "kunlun");
        setup();
        replace_program(ROOM);
}
