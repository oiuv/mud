inherit ROOM; 
 
void create() 
{ 
	set("short", "镇远镖局");
	set("long", @LONG
里面就是镇远镖局的总部，说到镇远镖局的大名在北京城乃至整个北方是
无人不知，无人不晓，每天慕名来拜师的人也很多。大门两侧有两头高大的石
狮子。东边是一棵槐树，郁郁葱葱，遮盖了大半个院子，整个院子里阴阴凉凉
的。 
LONG
	);

	set("exits", ([
  		"enter" : __DIR__"front_yard",
  		"south" : __DIR__"di_anmen",
	]));

  	set("objects", ([
                CLASS_D("zhenyuan") + "/tongzhaohe" : 1,
	]));

	setup();
}

int valid_leave(object me, string dir)
{
        object tong;

        if (dir != "enter" ||
            ! objectp(tong = present("tong zhaohe", this_object())))
                return ::valid_leave(me, dir);

        return tong->permit_pass(me, dir);
}
