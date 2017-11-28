// Filename : /cmds/verb/get.c

#include <ansi.h>
#include <command.h>

inherit F_CLEAN_UP;

int do_get(object me, object ob, int raw);

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
        string from, item;
        object obj, *inv, env, obj2;
        mixed info;
        string msg;
        int i, amount;

        if (! arg) return notify_fail("你要捡起什麽东西？\n");

        // Check if a container is specified.
        if (sscanf(arg, "%s from %s", arg, from) == 2)
        {
                env = present(from, me);
                if (! env) env = present(from, environment(me));
                if (! env) return notify_fail("你找不到 " + from + " 这样东西。\n");
                if (me == env) return notify_fail("毛病！你要搜自己的身？\n");
                if (env->query("no_get_from") || living(env))
                {
			if (! wizardp(me))
				return notify_fail("你不能搜身。\n");

                        if (wiz_level(me) <= wiz_level(env) &&
                            ! MASTER_OB->valid_write(base_name(env), me, "get"))
                                return notify_fail("你的巫师等级必须比对方高才能搜身。\n");

                        if (wiz_level(me) < 3)
                                return notify_fail("你的巫师等级不够搜身。\n");

                        if (! me->is_admin())
                        {
                                switch (SECURITY_D->query_site_privilege("get"))
                                {
                                case "all":
                                        break;

                                case "noneuser":
                                        if (playerp(env))
                                                return notify_fail("你不能搜玩家控制人物的身。\n");

                                case "user":
                                        if (! playerp(env))
                                                return notify_fail("你不能搜非玩家控制人物的身。\n");

                                default:
                                        return notify_fail("你不能搜身。\n");
                                }
                        }
                }
        } else env = environment(me);

        // Check if a certain amount is specified.
        if (sscanf(arg, "%d %s", amount, item) == 2)
        {
                if (! objectp(obj = present(item, env)))
                        return notify_fail("这里没有这样东西。\n");

                if (!obj->query_amount())
                        return notify_fail( obj->name() + "不能被分开拿走。\n");

                if (amount < 1)
                        return notify_fail("东西的个数至少是一个。\n");

                if (amount > obj->query_amount())
                        return notify_fail("这里没有那麽多的" + obj->name() + "。\n");

                else if (amount == (int)obj->query_amount())
                {
                        // get object when fighting costs time
                        if (me->is_fighting() && ! me->is_busy()) me->start_busy(1);
                        return do_get(me, obj, 0);
                } else
                {
                        obj->set_amount((int)obj->query_amount() - amount);
                        obj2 = new(base_name(obj));
                        obj2->set_amount(amount);
                        // Counting precise amount costs more time.
                        if (me->is_fighting() && ! me->is_busy()) me->start_busy(3);
                        if (! do_get(me, obj2, 0))
                        {
                                obj2->move(env);
                                return 0;
                        }
                        return 1;
                }
        }

        // Check if we are makeing a quick get.
        if (arg == "all")
        {
                object my_env;

                if (me->is_fighting())
                        return notify_fail("你还在战斗中！只能一次拿一样。\n");

                if (! env->query_max_encumbrance())
                        return notify_fail("那不是容器。\n");

                my_env = environment(me);
                inv = all_inventory(env);
                for (i = 0, amount = 0; i < sizeof(inv); i++)
                {
                        if (! living(me)) break;
                        if (environment(me) != my_env) break;
                        if (inv[i]->is_character() || inv[i]->query("no_get"))
                                continue;
                        amount += do_get(me, inv[i], 1);
                }
                if (! amount)
		{
                        write("你什么都没有拣起来。\n");
			return 1;
		}

                if (env->is_character())
                        msg = me->name() + "从" + env->name() + "身上搜出了一堆东西。\n";
                else
                if (env == my_env)
                        msg = me->name() + "把地上的东西都拣了起来。\n";
                else
                        msg = me->name() + "把" + env->name() + "里面的东西都拿了出来。\n";
                message("vision", msg, environment(me), ({ me }));
                write("捡好了。\n");
                return 1;
        }

        if (! objectp(obj = present(arg, env)) || living(obj))
                return notify_fail("你附近没有这样东西。\n");

        if (info = obj->query("no_get"))
                return notify_fail(stringp(info) ? info : "这个东西拿不起来。\n");

        // get object when fighting costs time
        if (me->is_fighting() && ! me->is_busy()) me->start_busy(1);

        return do_get(me, obj, 0);
}
        
int do_get(object me, object obj, int raw)
{
        object old_env, *guard;
        string msg;
        int equipped;

        if (! obj) return 0;
        old_env = environment(obj);

        if (obj->is_character() && living(obj)) return 0;
        if (obj->query("no_get")) return 0;

        if (guard = obj->query_temp("guarded"))
        {
                guard = filter_array(guard, (: objectp($1) && present($1, environment($2)) &&
                                               living($1) && ($1 != $2) :), me);
                if (sizeof(guard))
                        return notify_fail( guard[0]->name() 
                                + "正守在" + obj->name() + "一旁，防止任何人拿走。\n");
        }

        if (obj->query("equipped")) equipped = 1;
        if (sizeof(all_inventory(me)) >= MAX_ITEM_CARRIED)
                return notify_fail("你身上的东西实在是太多了，没法再拿东西了。\n");

        if (obj->move(me))
        {
                if (obj->is_character() && obj->query_weight() > 20000)
		{
			object cloth;
			int iknow;
                        message_vision("$N将$n扶了起来背在背上。\n", me, obj);
			cloth = obj->query_temp("armor/cloth");
			iknow = me->query("name") + "的尸体" == obj->name();
			if (cloth)
			{
				// is the cloth daub with poison ?
				DAUB_CMD->check_poison(me, cloth, iknow);
			} else
			{
				// is the corpse daub with poison ?
				DAUB_CMD->check_poison(me, obj, iknow);
			}
                } else
                {
                        msg = sprintf("$N%s一%s%s。\n",
                                (! old_env || old_env == environment(me)) ? "捡起" :
                                old_env->is_character() ?  "从" + old_env->name() + "身上" + (equipped ? "除下" : "搜出") :
                                old_env->is_tree() ? "从" + old_env->name() +"上摘下" :
                                                     "从" + old_env->name() + "中拿出",
                                obj->query("unit"), obj->name());
                        if (! raw)
                                message_vision(msg, me);
                        else
                                write(replace_string(msg, "$N", "你"));
                }
                return 1;
        }
        else return 0;
}

int help(object me)
{
        write(@HELP
指令格式 : get <物品名称> | all [from <容器名>]
 
这个指令可以让你捡起地上或容器内的某样物品.
 
该命令在可以被授权使用的信息包括：noneuser、user、all。
HELP );
    return 1;
}
