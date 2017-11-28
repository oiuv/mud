
inherit ITEM;
int do_tear(string arg);

void init()
{
        add_action("do_tear", "tear");
}

void create()
{
        set_name("四十二章经一", ({"book1"}));
        set_weight(1000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("long", "\n一本镶黄旗的经书,封皮(binding)很精致。\n");
                set("unit", "本");
                set("material", "paper");
        }
        setup();
}


int do_tear(string arg)
{
	object me;
	string dir;
	me = this_player();

        if( !arg || arg=="" ) return 0;

	if(arg=="book1")
	{
	message_vision("$N一下把经书撕得粉碎。\n", this_player());
	destruct(this_object());
	return 1;
	}

	if( sscanf(arg, "book1 %s", dir)==1 ) {
	if( dir=="binding" ) {
		if(this_object()->query("hasgot"))
		message_vision("$N将封皮撕开,发现羊皮已经被取走了。\n", this_player());
		else
		{
		message_vision("$N将封皮撕开，几块羊皮掉了下来。\n", this_player());
		message_vision("$N先将羊皮上的地图记了下来，然后把它们烧掉了。\n", this_player());
	        me->set("huanggong/haspi1", 1);
                this_object()->set("hasgot",1);  
        	}
	}
        else
	{
	message_vision("$N一下把经书撕得粉碎。\n", this_player());
	destruct(this_object());
	}
	return 1;
        }	
}