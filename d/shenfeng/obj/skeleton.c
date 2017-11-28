inherit ITEM;

void create()
{
	set_name("枯乾的骸骨", ({ "Skeleton", "skeleton", "骸骨" }));
        set_weight(500);
        if (clonep())
        	set_default_object(__FILE__);
    	else {
        	set("unit", "具");
                set("long", "这副骸骨已经躺在这里很久了。\n");
        	set("value", 1);
        	set("no_get", "这东西一碰就散，还是别拣吧！\n");
    	}
}
