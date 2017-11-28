inherit ROOM;

void create()
{
	set("short", "杂货铺");
	set("long", @LONG
这里是北京城东长安街最东边的一家杂货铺，杂货铺不大，门前高高的挂
着一条横幅，上面写着“南北货”三个大字，横幅纸张已经泛黄，看来这家店
铺在这里已经有一段历史了。店铺里大箱小箱堆满了一地，都是一些普通的日
常用品。店铺掌柜懒洋洋地躺在一只躺椅上，招呼着过往行人。墙边立着一块
价目表(board)。
LONG );
	set("item_desc", ([
		"board": "请用 \"list\" 列出货物表，\"buy\" 向老板购物。\n",
	]));
	set("exits", ([
		"west" : __DIR__"caroad_e2",
	]));
	set("objects", ([
		__DIR__"npc/hu": 1,
	]));

	setup();
	replace_program(ROOM);
}

