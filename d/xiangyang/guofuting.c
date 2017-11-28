// Room: /d/xiangyang/guofuting.c
// Date: Jan. 8 1999 by Winder

inherit ROOM;

void create()
{
	set("short", "郭府客厅");
	set("long", @LONG
这里是郭府的客厅。厅虽不大，却布置的挺雅致。东壁悬
挂着四幅屏条，绘的是梅兰菊竹四种花卉；西壁悬挂的是春夏
秋冬。内厅居中的是一张八仙桌。桌上端放着一套茶具，两旁
摆放着四张檀香椅，显得极为古朴。厅角各摆放着一盆牡丹花，
似乎给这里带来一丝暖意。北壁内墙的神龛供奉岳飞的画像，
上面是一条横幅，上书“还我河山”。
LONG );
	set("exits", ([
		"south" : __DIR__"guofuyuan",
		"north" : __DIR__"guofuhuayuan",
	]));
	set("objects", ([
		__DIR__"npc/guo" : 1,
	]));
	setup();
	replace_program(ROOM);
}

