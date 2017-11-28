// Room: /d/shaolin/shulin11.c
// Date: YZC 96/01/19

#include <ansi.h>

inherit ROOM;

void create()
{
	set("short", "松树林");
	set("long", @LONG
你眼前骤然一黑，朦胧中，只见左右前后，到处都是铺天盖
地的松树林。几十丈高的大松树簇在一块，密实的枝叶象一蓬蓬
巨伞般伸向天空，把阳光遮得丝毫也无。尺把厚的松针积在地上，
一脚踩下去，半天拔不出来。你似乎迷失了方向，象没头苍蝇般
到处乱闯。
LONG );
	set("exits", ([
		"east" : __DIR__"shulin"+(random(8)+6),
		"south" : __DIR__"shulin"+(random(8)+6),
		"west" : __DIR__"shulin"+(random(8)+6),
		"north" : __DIR__"shulin"+(random(8)+6),
	]));
        set("no_acc_drop",1);
	set("no_clean_up", 0);
	set("outdoors", "shaolin");
	setup();
}

void init()
{
	object ob, room;
	mapping fam;

	int i = random(2);
	if( i == 0) return;

	ob = this_player();
	room = this_object();

	if (ob->query("id") == "seng bing" || !living(ob)) return;

	room->delete("exits");

	if ( (fam = ob->query("family"))
	&& fam["family_name"] == "少林派" 
	&& ob->query("guilty") != 1 )  
	ob->set("guilty",3);

	ob->set("startroom", "/d/shaolin/jlyuan");

	message_vision(HIR "\n$N一不小心，走进了僧兵们设下的陷阱！
$N只觉得脚下一阵巨痛，原来是踩上了埋在地下的竹签。\n\n" NOR, ob);

	message_vision(HIR "\n$N痛得几乎失去了知觉......\n\n" NOR, ob);

	call_out("trapping", 20, ob, room);

}

void trapping(object ob, object room)
{
	if (! ob || ! living(ob) || environment(ob) != this_object())
		return;

	message_vision(HIY "\n僧兵们把$N从陷井里起了出来，送进了戒律院！\n\n\n" NOR, ob);
     	ob->move(__DIR__"jlyuan"); 

	room->set("exits/south", __DIR__"shulin"+(random(8)+6));
	room->set("exits/north", __DIR__"shulin"+(random(8)+6));
	room->set("exits/east", __DIR__"shulin"+(random(8)+6));
	room->set("exits/west", __DIR__"shulin"+(random(8)+6));
}

