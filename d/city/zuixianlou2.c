inherit ROOM;

void create()
{
	set("short", "醉仙楼二楼");
	set("long", @LONG
这里是雅座，文人学士经常在这里吟诗作画，富商土豪也
喜欢在这里边吃喝边作交易。这里也是城里举办喜宴的最佳场
所。你站在楼上眺望，只觉得心旷神怡。东面是一池湖水，碧
波荡漾。北面是崇山峻岭，而南面可以看到闻名全国的白鹿书
院的后庭。喜宴庆典在东边大堂。
LONG );
	set("item_desc", ([
		"paizi" : "本店出售烤鸭及上等花雕酒。\n",
	]));
	set("objects", ([
		__DIR__"npc/xian" : 1,
		__DIR__"npc/guidao" : 1,
	]));
	set("exits", ([
		"down" : __DIR__"zuixianlou",
		"up" : __DIR__"zuixianlou3",
		"east": __DIR__"zxlpath",
	]));
	setup();
	replace_program(ROOM);
}
