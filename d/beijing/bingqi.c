inherit ROOM;

void create ()
{
	set ("short", "兵器架");
	set ("long", @LONG
这里有一个兵器架 (jia)，十八般兵刃样样齐全。架子旁边挂着数十副闪
闪发光的盔甲，腰带，和战靴等物。旁边一位镖师正闭目养神，看来可以跟他
要(yao)一副衣甲和一件趁手的兵器。
LONG);

	set("item_desc", ([
			"jia" : "这是一个兵器架，上面摆满了甲(body)、盔(helmet)、靴(feet)、护心镜(waist)以及各类兵器。\n",
	]));

	set("exits", ([
			"west" : __DIR__"front_yard2",
	]));

	set("objects", ([
			__DIR__"npc/qianzhenglun": 1,
	]));

	setup();
	replace_program(ROOM);
}
