//Cracked by Roath
// bow.c
// kane, 13/8/98

#include <ansi.h>
#include <weapon.h>

#ifdef AS_FEATURE
#include <dbase.h>
#else
inherit EQUIP;
#endif

private int shoot_result(object me, object victim, object ob);
mapping default_dirs = ([
        "north":        "北",
        "south":        "南",
        "east":         "东",
        "west":         "西",
        "northup":      "北",
        "southup":      "南",
        "eastup":       "东",
        "westup":       "西",
        "northdown":    "北",
        "southdown":    "南",
        "eastdown":     "东",
        "westdown":     "西",
        "northeast":    "东北",
        "northwest":    "西北",
        "southeast":    "东南",
        "southwest":    "西南",
        "up":           "上",
        "down":         "下",
        "out":          "外",
        "enter":        "里",
]);

void init()
{
        add_action("do_pull","pull");
        add_action("do_shoot","shoot");
	add_action("do_reload", "reload");
}

varargs void init_bow(int damage, int flag)
{
	if( clonep(this_object()) ) return;

	set("weapon_prop/damage", damage);
	set("flag", flag );
	set("skill_type", "archery");
	if( !query("actions") ) {
		set("actions", (: call_other, WEAPON_D, "query_action" :) );
		set("verbs", ({ "bash", "crush", "slam" }) );
	}
}

int do_reload(string arg)
{
	object me, ob, arrow, load_arrow;
	string str;	

	me = this_player();
	ob = this_object();

	if (!arg || !objectp(arrow = present(arg, me)) ) 
		return notify_fail("你要把什么搭在弓上？\n");
	
	if ( arrow->query("weapon_type") != "arrow" )
		return notify_fail("并不是每样物品都可以当箭射的。\n");
	
	if ( ob->query_temp("arrow_loaded") )
		return notify_fail("你已经搭上箭了。\n");

	load_arrow = new(base_name(arrow));
	load_arrow->set_amount(1);

        if( arrow->query("poison_type") ) {
                ob->set("poison_applied", arrow->query("poison_applied"));
                ob->set("poison_type", arrow->query("poison_type"));
        }

        if( ob->query("pull_msg") )
                message_vision(ob->query("reload_msg"), me,arrow);
        else
                message_vision("$N轻展双臂，将$n缓缓搭在弓上。\n",me, load_arrow);

	
	ob->set("org_long", ob->query("long"));
	str = ob->query("long")+"上面已经搭了一支"+load_arrow->name()+"。\n";
	ob->set("long", str);

	ob->set_temp("arrow_loaded", load_arrow);
        
	if (arrow->query_amount() > 1)
                arrow->add_amount(-1);
        else destruct(arrow);
	return 1;
}
	
int do_pull(string arg)
{
        object me, ob;

        me = this_player();
        ob = this_object();

        if (arg != "bow" && arg != this_object()->query("id") )
                return command(query_verb()+" "+arg);

        if( (string)ob->query("equipped")!="wielded" )
                return notify_fail("你想往自己身上招呼？\n");

	if( ob->query("broken"))
		return notify_fail("这张弓的弦已经断了。\n");

        if( ob->query("str_requirement") )
                if( me->query_str() < ob->query("str_requirement") )
                        return notify_fail("你试了试，发现拉不开这张弓。\n");

        if( ob->query_temp("pulled") )
                return notify_fail("你已经把弓拉开了。\n");

	ob->add("wear_out", 1);

	if( ob->query("wear_out") > ob->query("bow_power")+random(10)){
		message_vision("$N力灌双臂，吐气开声，只听啪的一声，$n的弓弦被拉断了。\n", me, ob);
		ob->set("name", "断掉的"+ob->query("name"));
		ob->set("value", 0);
		ob->set("broken", 1);
		return 1;
	}
        if( ob->query("pull_msg") )

                message_vision(ob->query("pull_msg"), me,ob);
        else
             	message_vision("$N力灌双臂，吐气开声，顿时把一张$n拉得如同满月。\n",me, ob);

        ob->set_temp("pulled", 1);

        return 1;
}

int do_shoot(string arg)
{
        object me, victim, ob, env, obj, arrow/*, where*/;
        string enemy, dir, dest, target;
        mapping exit;

        me = this_player();
        ob = this_object();

        env = environment(me);

        if(!env) return notify_fail("你哪里也射不了。\n");

        if (env->query("pigging") || (env->query("short") == RED"武庙"NOR)
        || env->query("sleep_room") )
                return notify_fail("这里不准战斗。\n");

        if( !arg || sscanf(arg, "%s at %s", enemy, dir) != 2 )
                return notify_fail("命令格式: shoot <某人> at <方向>。\n");

        if( (string)ob->query("equipped")!="wielded" )
                return notify_fail("弓还挂在你背后呢。\n");

		  if( me->is_busy() )
                return notify_fail("你的动作还没有完成，不能射。\n");

        if( !objectp(arrow = ob->query_temp("arrow_loaded") ) )
                return notify_fail("你没搭箭怎么射？\n");

        if( !ob->query_temp("pulled") )
                return notify_fail("你弓还没拉开，怎么射？\n");

        if( !mapp(exit = env->query("exits")) || undefinedp(exit[dir]) ) {
                if( query_verb()=="shoot")
                        return notify_fail("这个方向射不过去。\n");
                else
                        return 0;
        }

        dest = exit[dir];

        if( !(obj = find_object(dest)) )
                call_other(dest, "???");
        if( !(obj = find_object(dest)) )
                return notify_fail("无法射。\n");

        if( !undefinedp(default_dirs[dir]) )
					 target = default_dirs[dir];
		  else
					 target = obj->query("short");

		  if (obj->query("pigging") || (obj->query("short") == RED"武庙"NOR)
		  || obj->query("sleep_room") )
                return notify_fail("你瞄准之处不准战斗。\n");

        if( !objectp(victim = present(enemy, obj)) )
                return notify_fail("你瞄准之处没有你的目标。\n");

		  if (!living(victim))
					 return notify_fail("你的目标不是活物！\n");

		  if ( victim->query("age")<20 )
					 return notify_fail("拿小孩子试招？太狠了吧！\n");

		  if( ob->query("shoot_msg") )
					 message_vision(ob->query("shoot_msg"), me, victim);
		  else
					 message_vision(HIY"\n$N三指一松，「嗖」的一声向" +target + "面的$n射了过去！！！\n" NOR, me, victim);

		  ob->delete_temp("pulled");
	ob->delete_temp("arrow_loaded");
	ob->set("long", ob->query("org_long"));
	ob->delete("org_long");

		  if( arrow->query("shoot_msg") )
					 message_vision(arrow->query("shoot_msg"),arrow, victim);
		  else
                message_vision(HIR "\n只见一支劲箭向着$N破空激射而至！！！\n" NOR,victim);

		  shoot_result(me,victim,arrow);
		  return 1;
}

private int shoot_result(object me, object victim, object ob)
{
		  object ob2/*, *inv*/;
		  string *limbs, str, dodge_skill, limb, result;
		  int /*i,embedded,*/ ap, dp/*, damage, time*/, power, level, jiali;


	if( me->query("neili") > me->query("jiali") )
		jiali = me->query("jiali");
	else jiali = me->query("neili");
	me->add("neili", -jiali);

		  if( this_object()->query("bow_power") )
					 power = this_object()->query("bow_power");
		  else power = 20;
	level = me->query_skill("archery",1);
	if( level < 1 ) level = 2;

		  ap = me->query_str() - ob->query_weight()/300;
		  dp = victim->query_dex();
		  ap *= me->query("combat_exp")/1500;
		  ap *= power/20;
	if( !userp(victim) ) ap *= level/200;
		  dp *= victim->query("combat_exp")/1000;
		  ap = (ap+random(ap))/2;

		  victim->add_temp("offenders/"+me->query("id"), 1);

		  if ( ap > dp){
		  limbs = victim->query("limbs");
					 victim->receive_wound("qi", me->query_str(), me);
					 victim->receive_damage("qi", ob->query_weight()/100, me);

	if(!victim->query_temp("armor/embed")){
											ob2=new(base_name(ob));
											ob2->set_amount(1);
				 ob2->set("embedded",1);
											ob2->move(victim);
											ob2->do_embed();
											victim->receive_wound("qi",
				 power*ob->query("damage")+jiali*2, me);
					message_vision(CYN"结果$N一声惨叫，$n"+CYN+"已然插在$N的"+limbs[random(sizeof(limbs))]
					+"上。\n"NOR, victim, ob);
	} else {
	//	ob2 = present("arrow", victim);
		ob2 = victim->query_temp("armor/embed");

		if ( ob2->query("weapon_type") == "arrow" ) {
			ob2->set_amount(ob2->query_amount()+1);
				message_vision(CYN"结果$N一声惨叫，$n"+CYN+"已然插在$N的"+limbs[random(sizeof(limbs))]
				+"上。\n"NOR, victim, ob);
		} else {
			message_vision(CYN"$N闷哼一声，$n"+CYN+"从$N的"+limbs[random(sizeof(limbs))]
			+"擦过，刮下一大片皮肉，鲜血淋漓！\n"NOR, victim,ob);
			ob2 = new(base_name(ob));
			ob2->set_amount(1);
			ob2->move(environment(victim));
		}

		victim->receive_wound("qi",
					 power*ob->query("damage")+jiali*2, me);
					 }

					 me->start_busy(random(3));
/*
					 if (ob->query_amount() > 0) ob->add_amount(-1);
					 else ob->move(environment(victim));
*/

		  result = COMBAT_D->eff_status_msg((int)victim->query("qi") * 100 /(int)victim->query("max_qi"));
		  message_vision("($N"+result+")\n", victim);

	if( this_object()->query("poison_type") ) {
					 victim->apply_condition(this_object()->query("poison_type"),
					 1+this_object()->query("poison_applied"));
					 this_object()->delete("poison_applied");
		this_object()->delete("poison_type");
		message_vision(RED"$N似乎觉得伤口有点发痒！\n"NOR, victim);
		  }

	if( victim->query("combat_exp") >= me->query("combat_exp") * 2/3 )
		me->improve_skill("archery", me->query("int")/2);

	}

		  else if ( ap < dp/7 && ob->query_weight() < 7000
					 && victim->query("race") == "人类"){
					 message_vision(CYN"不料$N眼明手快，身子一侧，把$n"+CYN+"轻轻地接在手里。\n\n"NOR, victim, ob);
					 me->start_busy(random(3));
					 if (ob->query_amount() > 0){
											ob->add_amount(-1);
											ob2=new(base_name(ob));
											ob2->set_amount(1);
											ob2->move(victim);
					 }
					 else ob->move(victim);
/*
					 if (!userp(victim) && victim->query_temp("offenders/"+me->query("id")) > 1)
								victim->kill_ob(me);
*/
		  }

		  else {

		  dodge_skill = victim->query_skill_mapped("dodge");
					 if( !dodge_skill ) dodge_skill = "dodge";
					 str = SKILL_D(dodge_skill)->query_dodge_msg(limb);
					 message_vision(str, me, victim);

					 me->start_busy(random(3));
					 if (ob->query_amount() > 0){
                                 ob->add_amount(-1);
                                 ob2=new(base_name(ob));
                                 ob2->set_amount(1);
                                 ob2->move(environment(victim));
                }
		else ob->move(environment(victim));
/*
               if (!userp(victim) && victim->query_temp("offenders/"+me->query("id")) > 1)
                        victim->kill_ob(me);
*/
      }
        return 1;
}
