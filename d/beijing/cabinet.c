#include <ansi.h>

inherit ROOM;

void create ()
{
  	set ("short", "威武阁");
	set ("long", @LONG
迎门的一幅山水画非凡脱俗，定是名家手笔，画上有一块大匾，匾上书着
三个大字：“威武阁”。小几上的一对羊脂玉瓶里插的满满的都是晶莹剔透的
白菊，不知哪里放了个香炉，吐着一缕似有似无的暗香。一位镖师站在楼梯口，
守着上楼的路。也不知楼上住的是什么人。
LONG);

  	set("exits", ([
  		"east" : __DIR__"stone_road2",
  		"up" : __DIR__"cabinet2",
	]));

  	set("objects", ([
//        	__DIR__"npc/shangjianming": 1,
        ]));

  	setup();
}

int valid_leave(object me, string dir)
{
    	object guard, *inv, letter;
    	int i;
    	if(dir != "up") return ::valid_leave(me, dir);
    	inv=all_inventory(me);
    	i=sizeof(inv);
    	me->delete_temp("condition/carrying_player");
    	if(objectp(present("shang jianming", environment(me))))
   		guard=present("shang jianming", environment(me));
    	if(!guard) return ::valid_leave(me,dir);
    	while (i--)
    	{
        	if (userp(inv[i]))
            		me->add_temp("condition/carrying_player", 1);
        	continue;
    	}
    	if(me->query_temp("condition/carrying_player"))
    	{
        	return notify_fail(HIC"商剑鸣喝道：这位"+RANK_D->query_rude(me)+
			"若想上楼，先把背上的那个放下了！\n"NOR);
    	}
	if(guard) {
    	if(!(letter=present("shu xin", me))
       		||letter->query("header")!="王维扬总镖头亲启"
     		||me->query("family/family_name")!="八卦门")
    	{
        	return notify_fail(HIC"商剑鸣喝道：我师傅正在楼上小息，请不要上去打扰！\n"NOR);
    	}}
    	return ::valid_leave(me, dir);
}