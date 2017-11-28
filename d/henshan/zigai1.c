inherit ROOM;

void create()
{
	set("short","水莲洞内");
	set("long", @LONG
这里一片漆黑，什么都看不见，只听见水滴的声音。
LONG);
	set("exits",([
	       "east" :__DIR__"inhole2",           
	]));
	
	set("objects",([
	       "/clone/beast/yanjingshe" : 1,
	]));
	
	setup();

}

void init()
{
       	object me = this_player();

       	if (present("fire", me))
       	{
       		set("long", @LONG
越往里面走道路越是狭窄，洞里也是一丝阳光也射不进来，
如果没有火折的话，恐怕是寸步难行。不知道这条路是通向什
么地方，你只觉得这里阴风瑟瑟，不由地打了个寒颤。
LONG);
       		set("exits/west",__DIR__"zigai4",);
       	}
       	return ;
}

