#include <ansi.h>
inherit ROOM;
   

void create ()
{
        set("short", "高昌大门");
        set("long",
"你转过了一排树木，来到这里。只见一座石山上嵌著两扇
铁铸的大门。两扇大门看样子重逾千钧，据说是古代高昌国王
为了抵御强敌而设计的。铁门上铁锈斑驳，显是历时已久的旧
物。但是门上的门环(huan)。铁门上写着：

        " WHT "※※※※※※※※※※※※※※※※※※※
        ※                                  ※
        ※     " NOR + HIR "高     昌      大     殿" NOR + WHT "     ※
        ※                                  ※
        ※※※※※※※※※※※※※※※※※※※" NOR "\n\n");

        set("outdoors", "gaochang");
        set("exits", ([
                "southdown" : __DIR__"shijie3",
        ]));
        set("item_desc", ([
                "huan" : HIY "\n一只锈迹斑斑的金属门环，看样子似乎可以扭(turn)动。\n" NOR,
        ]) );
        setup();
}

void init()
{
        add_action("do_turn", "turn");
}

void check_trigger()
{
   	object room;
   	object me = this_player();
        int exp, pot, sc;

        exp = 1500 + random(1000);
        pot = 100 + random(900);
        sc = 10 + random(20);

	if ((int)query("left_trigger") == 2 &&
           (int)query("right_trigger") == 5 &&
           ! query("exits/down"))
	{
     		message("vision", WHT "\n忽然间，只听铁门发出轧轧的声音，露出一个向下的阶"
                                  "梯。\n" NOR, this_object());

		if (! (room = find_object(__DIR__"dadian")))
		room = load_object(__DIR__"dadian");

	     	if (room = find_object(__DIR__"dadian"))
		{
			set("exits/down", __DIR__"dadian");
		        room->set("exits/up", __FILE__);
                	message("vision", HIY "忽然间，只听铁门发出轧轧的声音，露出一个向"
                                          "上的阶梯。\n" NOR, room);

			if (! (int)me->query("skybook/baima/enter"))
			{
                		me->add("combat_exp", exp);
                		me->add("potential", pot);
                		me->add("score", sc);
                		tell_object(me, HIW "\n你成功的开启了高昌迷宫入口！\n" NOR + HIC "通"
                                                "过这次的历练，你获得了" + chinese_number(exp) + "点"
                                                "经验、" + chinese_number(pot) + "点潜能以及" +
                                                 chinese_number(sc) + "点江湖阅历。\n\n" NOR);
                                me->set("skybook/baima/enter", 1);
			}
     		}
     		delete("left_trigger");
     		delete("right_trigger");
     		call_out("close_passage", 10);
   	}
}

void close_passage()
{
   	object room;

   	if (! query("exits/down")) return;
   	message("vision", WHT "铁门忽然发出轧轧的声音，将向下的通道盖"
                          "住了。\n" NOR, this_object() );
   	if (room = find_object(__DIR__"dadian"))
	{
     		room->delete("exits/up");
     		message("vision", WHT "铁门忽然发出轧轧的声音，向上的"
                                  "通道又缓缓地被盖住了。\n" NOR, room);
   	}
   	delete("exits/down");
	delete("left_trigger");
	delete("right_trigger");
}


int do_turn(string arg)
{
   	string dir;
   	object me = this_player();

   	if (! arg || arg == "" ) return 0;

   	if (arg == "huan")
	{
	        if (me->query("max_neili") < 300)
		{
     			write(HIC "\n你使足劲扭动门环，可是门环还是纹丝不动。\n" NOR);
     			return 1;
		} else
		{
   	  		write(HIC "\n你试着扭动门环，发现门环似乎可以左右滑动。\n" NOR);
			delete("left_trigger");
			delete("right_trigger");
	     		return 1;
		}
   	}

   	if (sscanf(arg, "huan %s", dir) == 1)
	{
	        if (me->query("max_neili") < 300)
		{
     			write(HIC "\n你使足劲扭动门环，可是门环还是纹丝不动。\n" NOR);
     			return 1;
		} else
     		if (dir == "right" )
		{
			if (query("exits/down"))
				return notify_fail("铁门已经被扭开了。\n");

	        	message_vision(HIY "$N" HIY "将门环往右扭……忽然「喀」一声铁"
                                       "门又移回原位。\n" NOR, me);
        		add("right_trigger", 1);
        		check_trigger();
        		return 1;
     		} else
		if (dir == "left")
		{
			if (query("exits/down")) return notify_fail("铁门已经被扭开了。\n");
        		message_vision(HIY "$N" HIY "将门环往左扭……忽然「喀」一声铁"
                                       "门又移回原位。\n" NOR, me);
        		add("left_trigger", 1);
        		check_trigger();
        		return 1;
     		} else
		{
        		write("你要将门环往哪边扭？\n");
        		return 1;
     		}
   	}
}


void reset()
{
   	::reset();
   	delete("left_trigger");
   	delete("right_trigger");
}
