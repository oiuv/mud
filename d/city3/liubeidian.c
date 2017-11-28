inherit ROOM;

void create()
{
	set("short", "刘备殿");
	set("long", @LONG
这里是武侯祠的刘备殿。正中供着汉昭烈帝高可丈许。后
主却没得供奉，所谓 "扶不起来" 的阿斗吧。而哭庙玉碎的北
地王刘谌得能和英父同祀，令人不胜唏嘘。殿下左右是赵云等
的武将廊和蒋琬为首的文臣廊。
LONG);
	set("exits", ([
		"south"   : __DIR__"wuhoucigate",
		"northup" : __DIR__"wuhouci",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}
