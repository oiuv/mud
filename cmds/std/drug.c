// drug.c

inherit F_CLEAN_UP;

int do_effect(string type, mixed para);

void create()
{
        seteuid(getuid());
}

int main(object me, string arg)
{
	string item, target;
	object obj, dest;
        function f;

	if (! arg)
                return notify_fail("你要下什么毒？\n");

        if (me->is_busy())
                return notify_fail("先忙完了你手中的事情再想怎么害人吧！\n");

        if (me->is_fighting())
                return notify_fail("你现在正在打架，没时间下毒。\n");

	if (sscanf(arg, "%s in %s", item, target) != 2)
		return notify_fail("你要往哪里下毒？\n");

	dest = present(target, me);
	if (! dest)
                return notify_fail("这里没有这样东西。\n");

	if (! objectp(obj = present(item, me)))
		return notify_fail("你身上没有这样东西。\n");

	if (! stringp(obj->query("poison_type")))
                return notify_fail("这不是毒药啊。\n");

        if (! obj->query("can_drug"))
                return notify_fail("这种毒药不能下在食物中。\n");

	if (dest->query("food_remaining") < 1)
	{
		tell_object(me, "这东西看上去没有人会去吃。\n");
		return 1;
	}

	message("vision", sprintf("%s将一东西偷偷洒到了%s上面。\n",
		me->name(), dest->name()), environment(me), ({ me }));

	message("vision", sprintf("你将一%s%s偷偷洒到了%s上面。\n",
		obj->query("unit"), obj->name(), dest->name()), me);

        f = bind((: call_other, __FILE__, "do_effect",
                    obj->query("poison_type"),
                    obj->query("poison") :), dest);
        dest->apply_effect(f);
        if (obj->query_amount() > 1)
                obj->add_amount(-1);
        else
	        destruct(obj);
	return 1;
}

int do_effect(string type, mixed para)
{
        object me = this_player();
        mapping p;

        if (! objectp(me))
                return 1;

        if (mapp(para))
        {
                p = allocate_mapping(4);
                p["level"] = para["level"];
                p["id"]    = para["id"];
                p["name"]  = para["name"];
                p["duration"] = para["duration"] / 2 +
                                random(para["duration"] / 2);
                me->affect_by(type, p);
        } else
        {
                int old;
                if (intp(para) && intp(old = me->query_condition(type)))
                        me->apply_condition(type, para + old);
                else
                        me->apply_condition(type, para);
        }

        return 1;
}

int help(object me)
{
write(@HELP
指令格式 : drug <毒药> in <食物>
 
这个指令可以让你将某样毒药下在食物中。
HELP
    );
    return 1;
}
