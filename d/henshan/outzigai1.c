#include <ansi.h>
inherit ROOM;

string look_bi(object me,string msg);
void auto_close();

void create()
{
	set("short","突石上");
	set("long",@LONG
站在这里向下望才发现自己已经离地面有十来丈高了，寻
望洞内发现四周虽都有突石，但是唯有脚下这块能容人站在上
面观望。仔细观察突石周围发现身后的石壁(bi)中竟有一丝细
小的裂缝，方才在下面看到的光亮就是从这裂缝中投射出来的。
LONG);
	set("exits",([
	       "down":__DIR__"outzigai",		
	]));

	set("no_fight",1);

	set("item_desc",([
	       "bi":(:look_bi:),
	]));
	
	setup();

}


string look_bi(object me,string msg)
{
	object here;

	me = this_player();

	if ( !here = find_object(__DIR__"outzigai1"))
              here = load_object(__DIR__"outzigai1");
	

	if (here->query_temp("marks/破"))
		return "石壁已经被打破了。\n";
	
	if (here->query_temp("marks/推"))
		return HIC"\n石门已经被推开了，却露出一个山洞来。\n"NOR;

	msg="这块石壁看起来很坚实，也许是由于长年被水流冲蚀，上面已\n经出现了"
	    "一条细小的裂缝。一丝阳光从缝中投射进来，看来外\n面应该有出路了。\n";

	return msg;
	          	
}


void init()
{
	object me = this_player();
        object here;
        string msg;

        if ( !here = find_object(__DIR__"outzigai1"))
              here = load_object(__DIR__"outzigai1");
	 
        if (here->query_temp("marks/推"))
        {
       tell_object(me,HIY"阳光照射在你脸上，你感到舒服极了。\n"NOR);

       delete("long");
       set("long",HIY @LONG
你环视四周，发现这里距地面竟有十来丈高了，阳光从身
后的洞中洒了出来，石壁上水珠反射出耀眼的光环，突石上的
青苔也显"得绿油油的，你觉得浑身说不出的畅快。
LONG);
        }
          
	add_action("do_tiao",({"tiao","jump"}));
	add_action("do_push",({"tui","push"}));
}

int do_tiao(string arg)
{	
	object me = this_player(),ob;

	if ( !ob = find_object(__DIR__"outzigai"))
              ob = load_object(__DIR__"outzigai");
	
	if( !arg || arg != "down")
		return notify_fail("你要往哪儿跳？\n");

	if (me->query_skill("dodge",1) < 120)
	{
	message_vision("\n$N鼓起勇气纵身往下一跳...\n",me);
	me->unconcious();	
	me->move(__DIR__"outzigai");
	tell_room(ob,""+me->name()+"从上面摔了下来，昏倒了。\n");
	return 1;
	}
	
	message_vision("\n$N你纵身一跳，稳稳地落在了地上。\n\n",me);
	me->move(__DIR__"outzigai");
	message("vision",""+me->name()+"从上面跳了下来。\n",ob,me);
	return 1;
	
}

int do_push(string arg)
{
	object me = this_player(),obj,obhere;
	string msg;

	if ( !obj = find_object(__DIR__"zigaihole"))
              obj = load_object(__DIR__"zigaihole");

	if ( !obhere = find_object(__DIR__"outzigai1"))
              obhere = load_object(__DIR__"outzigai1");	

	if ( !arg || arg != "bi")
	{
	write("你要推什么？\n");
	return 1;
	}

	if (obhere->query_temp("marks/推"))
	{
	write("石门已经被推开了。\n");
	return 1;
	}
	
	if (me->query("neili") < 1500 || me->query_skill("unarmed",1) < 80)
	{		
	write("你使出浑身解数用力推石壁，可以石壁却纹丝不动。\n");
	return 1;
	}

	msg = HIC"\n$N用力将石壁往旁边一推，轰！地一声，石壁已被推开，露出"NOR;
        msg += HIC"一个山洞来。这竟是一扇石门。\n\n"NOR;

	message_vision(msg,me);

	tell_room(obhere,HIY"阳光照射了进来，耀眼夺目。\n\n"NOR);
	tell_room(obj,HIC"洞外轰！地一声，像是有人将石门推开了。\n"NOR);

	set("exits/enter",__DIR__"zigaihole");

	obhere->set_temp("marks/推",1);
	obj->set_temp("marks/推",1);
	obj->set("exits/out",__DIR__"outzigai1");

        if (obhere->query_temp("marks/推"))
        {

         delete("long");
       set("long",HIY @LONG
你环视四周，发现这里距地面竟有十来丈高了，阳光从身
后的洞中洒了出来，石壁上水珠反射出耀眼的光环，突石上的
青苔也显"得绿油油的，你觉得浑身说不出的畅快。
LONG);
        }

	call_out("auto_close",13);

	return 1;
}

void auto_close()
{
	object obin,obout,me=this_player();

	if ( !obin = find_object(__DIR__"zigaihole"))
              obin = load_object(__DIR__"zigaihole");

	if ( !obout = find_object(__DIR__"outzigai1"))
              obout = load_object(__DIR__"outzigai1");

	tell_room(obin,HIW"\n轰！轰！轰！不知道谁将石门关上了。\n"NOR);
	tell_room(obout,HIW"\n轰！轰！轰！不知道谁将石门关上了，顿时山"
                        "洞里变得阴暗起来。\n"NOR);

	delete("exits/enter");
	obin->delete("exits/out");
	obin->delete_temp("marks/推");
	obout->delete_temp("marks/推");

        delete("long");
        set("long",@LONG
站在这里向下望才发现自己已经离地面有十来丈高了，寻
望洞内发现四周虽都有突石，但是唯有脚下这块能容人站在上
面观望。仔细观察突石周围发现身后的石壁(bi)中竟有一丝细
小的裂缝，方才在下面看到的光亮就是从这裂缝中投射出来的。
LONG);

	return ;
}





int valid_leave(object me,string dir)
{
	me=this_player();
	
	if(dir=="down")
	        return notify_fail ("这里又没有路，看来只有跳下去了。\n");
	 	
	return 1;

}







