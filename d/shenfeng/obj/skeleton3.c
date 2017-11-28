inherit ITEM;

#define FEITUO     "/clone/lonely/feituo"

void create()
{
        object ob;
	set_name("枯乾的骸骨", ({ "Skeleton", "skeleton", "骸骨" }));
        set_weight(500);
        set_max_encumbrance(800000);
        set("unit", "副");
        set("long", "这副骸骨已经躺在这里很久了。\n");
        set("value", 1);
        set("no_get", "这东西一碰就散，还是别拣吧！\n");
        if (clonep())
	{
        	set_default_object(__FILE__);
	        ob = find_object(FEITUO);
        	if (! ob) ob = load_object(FEITUO);
                if (! environment(ob))
                        ob->move(this_object());
    	}
}
