inherit ROOM;

void create()
{
	set("short", "井底");
	set("long", @LONG
这是一口极深的水井。浮在水面往上看，只觉得圆圆的天空是那么可
爱。井壁(wall)上满是滑溜溜的青苔。一个轱辘吊着一根长绳(string)，
绳端系着一个木桶(mutong)。木桶悬在空中，离你很近，只差一点就可
以够得着。
LONG );
        set("outdoors", "huanggong");
	set("no_clean_up", 0);
	set("resource/water", 1);
	setup();
}

void init()
{
	add_action("do_climb", "climb");
	add_action("do_climb", "pa");
	add_action("do_jump", "tiao");
	add_action("do_jump", "jump");
	add_action("do_reach", "reach");
}

int do_reach(string arg)
{
        object me;
        me = this_player();
        if (!arg||arg=="") return 0;
	if( arg=="mutong") {
		message_vision(
		"\n$N试著去抓木桶，但总是差一点够着，要能跳高一点就好了。\n", me);
	}
	if( arg=="string") {
		message_vision(
		"\n$N试著去抓长绳，但总是差一点够着，要能跳高一点就好了。\n", me);
	}
return 1;
}

int do_climb(string arg)
{
        object me;
        me = this_player();
	if (!arg && (arg != "wall")&& (arg != "string"))
		return notify_fail("你要爬什么？\n");
	if( arg=="wall" ) {
		message_vision(
		"\n$N接连试了好几次，可是井壁太滑，怎么也上不去。\n", me);
	}
	if( arg=="string" ) {
        if(me->query_temp("hasjump"))
	{
        me->delete_temp("hasjump");
        message_vision(
	"$N顺着长绳往上爬，终于爬出了深井，重见天日。\n", me);
        message_vision(
	"$N仰天长笑道：这世上就没有我做不成的事啊，哈哈哈。。。\n", me);
	me->move("/d/huanggong/houyuan");
	}
	else return notify_fail("\n你够不着。\n");
	} 
return 1;
}

int do_jump(string arg)
{
        object me;
        me = this_player();
	if (!arg && (arg != "mutong") && (arg != "string"))
		return notify_fail("你要往那儿跳？\n");
		message_vision(
		"\n$N深吸一口气，向上猛的一跳，一下抓住了木桶。\n", me);
		message_vision(
		"只听骨碌碌一阵乱响，木桶一下拉到了头。$N高兴极了。\n", me);
                me->set_temp("hasjump",1);
	return 1;
}



