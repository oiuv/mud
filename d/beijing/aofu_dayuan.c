inherit ROOM;

void create()
{
	set("short", "鳌府大院");
	set("long", @LONG
你走进大院，迎面是一个大花园，花园中假山水池，很是美观。池中立着
一块巨大无比的翡翠，显然是鳌拜收刮来的宝物。水池的两旁种满了花草，郁
郁葱葱，树木枝叶茂密，遮盖了大半个院子，显得阴森恐怖。北边一条长长的
木制长廊，通往鳌府的大厅。
LONG );
	set("exits", ([
		"north" :  __DIR__"aofu_dating",
		"south" :  __DIR__"aofu_zoulang1",
	]));
	set("objects", ([
		__DIR__"npc/yuanding" : 1,
	]));

       setup();
	replace_program(ROOM);
}

