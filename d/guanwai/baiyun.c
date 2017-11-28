// /guanwai/baiyun.c

inherit ROOM;

void create()
{
	set("short", "白云峰");
	set("long", @LONG
白云峰在天池之西，鹿鸣峰之南，为长白山主峰。山峰圆而高大，临天
池而耸立，巍峨磅礴，如一口宝剑直插云天。天气晴好，天池十六峰毕露，
惟独此峰常有烟云缭绕，终日不散。古人有“看罢归来回首顾，白山依旧白
云封”的赞语。登临此峰，诚有飘飘欲仙之感。
LONG );
	set("exits", ([
		"north"      : __DIR__"luming",
		"eastdown"   : __DIR__"tianchi1",
		"southwest"  : __DIR__"yuzhu",
	]));
	set("no_clean_up", 0);
	set("outdoors", "guanwai");
	setup();
	replace_program(ROOM);
}
