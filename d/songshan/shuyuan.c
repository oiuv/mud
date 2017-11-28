inherit ROOM;

void create()
{
	set("short", "嵩阳书院");
	set("long", @LONG
这里原是嵩阳寺。现在文化昌明，就改成了嵩阳书院，和
睢阳书院，岳麓书院，白鹿书院合称天下 "四大书院" 。北宋
程颢程颐曾在此讲学。院内有古柏三株，汉武帝巡游至此，册
封为大将军，二将军，三将军。
LONG );
	set("exits", ([
		"southdown" : __DIR__"shandao2",
		"northwest" : __DIR__"shandao3",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

