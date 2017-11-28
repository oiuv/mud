// Room: /d/xiangyang/southjie3.c
// Date: Jan. 8 1999 by Winder

inherit ROOM;

void create()
{
	set("short", "南大街");
	set("long", @LONG
这里是襄阳城南大街的南头。南面就是朱雀内门，北边非
常热闹。东边是为襄阳城守军打制铠甲武器的兵器铺。十余年
来，由于蒙古军的侵犯，叮叮当当的打铁声音就一直响个不停。
西面是襄阳城的南兵营，隐隐能听见里面传来的兵士们的操练
声。
LONG );
        set("outdoors", "xiangyang");
	set("no_clean_up", 0);

	set("exits", ([
		"east"  : __DIR__"tiejiangpu",
		"west"  : __DIR__"bingying3",
		"south" : __DIR__"southgate1",
		"north" : __DIR__"southjie2",
	]));
	setup();
	replace_program(ROOM);
}
