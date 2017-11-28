// Room: /guiyun/shufang.c
// Date: Nov.18 1998 by Winder

inherit ROOM;

void create()
{
	set("short", "书房");
	set("long", @LONG
这是陆庄主的书房，琳琅满目，全是诗书典籍，几上桌上摆着
许多铜器玉器，看来尽是古物，壁上挂着一幅水墨画，画的是个中
年书生在月明之夜中庭伫立，手按剑柄，仰天长吁，神情寂寞，左
上角题着一首『词』(poem)。门楣上歪歪斜斜嵌着一个铁八卦，看
起来和房间不太相衬。
LONG );
//      set("outdoors", "guiyun");
//	set("no_clean_up", 0);

	set("exits", ([
		"west"  : __DIR__"dating",
	]));
	set("item_desc", ([
		"poem"  :
"
昨夜寒蛩不住鸣。惊回千里梦，巳三更。
起来独自绕阶行。人悄悄，帘外月胧明。

白首为功名。旧山松竹老，阻归程。
欲将心事付瑶琴，知音少，弦断有谁听？

                五湖废人病中涂鸦
",
	]));
	set("objects", ([
		CLASS_D("taohua")+"/lu" : 1,
		__DIR__"npc/shutong" : 1,
	]));
	setup();
	replace_program(ROOM);
}
