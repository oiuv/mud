// skeleton.c

inherit ITEM;

void create()
{
	set_name("骸骨", ({ "skeleton" }) );
	set("long", "这副骸骨已经躺在这里很久了。\n");
	set("unit", "具" );
	set("big_count", 1);
	set("small_count", 1);
}
void init()
{
	add_action("do_mai", "mai");
	add_action("do_mai", "bury");
}
int do_mai(string arg)
{
        int n;
        object ob, me = this_player();

        n = this_player()->query("neili");
        if( !arg || arg != "skeleton")
        {
                write("你要埋什么? \n");
                return 1;
        }
        if (me->query_temp("marks/jinshe") == "1")
        {
                if (n > 200 && query("small_count") == 1)
                {
                        message_vision(
"$N又向地下挖掘，这次泥土较坚，时时出现山石，挖掘远为费力。
堪堪又将挖了三尺，忽然叮的一声，锄头又碰到一物，拨开泥土，
居然又是一只铁盒。\n", me);
                        ob = new(__DIR__"smallbox");
                        ob->move(environment(me));
                        me->set_temp("marks/jinshe", "2");
                        add("small_count", -1);
                }
                else
                {
                        message_vision("$N挖不到什么，挖了几下就不想干了。\n", me);
                        me->set("neili",0);
                }
        }
        else
        {
                if (n > 100 && query("big_count") == 1)
                {
                        message_vision(
"$N发现地面很松软的，于是用力挖了起来。$N挖了一会，忽然叮
的一声，碰到一件铁器。移近火把一看，见底下有块铁板，再用
挖了几下，拨开旁边泥土，原来竟是一只两尺见方的大铁盒。\n", me);
                        ob = new(__DIR__"bigbox");
                        ob->move(environment(me));
                        me->set_temp("marks/jinshe", "1");
                        add("big_count", -1);
                }
                else
                {
                        message_vision("$N挖不到什么，挖了几下就不想干了。\n", me);
                        me->set("neili",0);
                }
        }
        return 1;
}

