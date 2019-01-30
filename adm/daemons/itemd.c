// itemd.c
// Update by Vin for Heros.cn

// #pragma optimize
// #pragma save_binary

#include <ansi.h>
#include <command.h>

void create() { seteuid(getuid()); }

// 可以用来浸透的物品列表：必须是物品的base_name
string *imbue_list = ({
        "/clone/fam/gift/int3",
        "/clone/fam/gift/con3",
        "/clone/fam/gift/str3",
        "/clone/fam/gift/dex3",
        //"/clone/fam/item/bless_water",
        //"/clone/fam/etc/lv7d",
        //"/clone/fam/etc/lv7c",
});

// 浸入的次数的随机界限：如果每次IMBUE以后取0-IMBUE次数的随机
// 数大于这个数值，则IMBUE最终成功。
#define RANDOM_IMBUE_OK         100

// 每次浸入需要圣化的次数
#define SAN_PER_IMBUE           5

// 杀了人以后的奖励
void killer_reward(object me, object victim, object item)
{
        int exp;
        mapping o;
        string my_id;

        if (! me || ! victim)
                return;

        if (! victim->query("can_speak"))
                // only human does effect
                return;

        // record for this weapon
	if (victim->is_not_bad())  item->add("combat/WPK_NOTBAD", 1);
	if (victim->is_not_good()) item->add("combat/WPK_NOTGOOD", 1);
	if (victim->is_good())     item->add("combat/WPK_GOOD", 1);
	if (victim->is_bad())      item->add("combat/WPK_BAD", 1);

        if (userp(victim))
                item->add("combat/PKS", 1);
        else
                item->add("combat/MKS", 1);

        exp = victim->query("combat_exp");
        if (exp < 10000 || me->query("combat_exp") < exp * 4 / 5)
                return;

        exp /= 10000;
        if (exp > 250) exp = 100 + (exp - 250) / 16; else
        if (exp > 50) exp = 50 + (exp - 50) / 4;
        my_id = me->query("id");
        o = item->query("owner");
        if (! o) o = ([ ]);
        if (! undefinedp(o[my_id]) || sizeof(o) < 12)
                o[my_id] += exp;
        else
        {
                // Too much owner, I must remove one owner
                int i;
                int lowest;
                string *ks;

                lowest = 0;
                ks = keys(o);
                for (i = 1; i < sizeof(ks); i++)
                        if (o[ks[lowest]] > o[ks[i]])
                                lowest = i;
                map_delete(o, ks[lowest]);
                o += ([ my_id : exp ]);
        }
        item->set("owner", o);
}

// 召唤物品
int receive_summon(object me, object item)
{
        object env;
        object temp;
        int type;

        if ((env = environment(item)) && env == me)
        {
                tell_object(me, item->name() + "不就在你身上"
                            "嘛？你召唤个什么劲？\n");
                return 1;
        }

        if (me->query("jingli") < 200)
        {
                tell_object(me, "你试图呼唤" + item->name() +
                            "，可是难以进入境界，看来是精力不济。\n");
                return 0;
        }
        me->add("jingli", -200);

        if (me->query("id") == "ivy")
        {
              message_sort(HIM "\n只见四周金光散布，祥云朵朵，远处有凤凰盘绕，麒麟逐戏。耳边"
                           "传来阵阵梵音。$N" HIM "一声长啸，" + item->query("name") + HIM
                           "破空而来 ……。\n\n" NOR, me);
        }
        else

              message_vision(HIW "$N" HIW "突然大喝一声，伸出右手凌空"
                             "一抓，忽然乌云密布，雷声隐隐。\n\n" NOR, me);

        if (env == environment(me))
        {
                message_vision(HIW "只见地上的" + item->name() +
                               HIW "应声而起，飞跃至$N" HIW
                               "的掌中！\n\n" NOR, me);
        } else
        {
                type = random(3);
                if (env)
                {
                        if (env->is_character() && environment(env))
                                        env = environment(env);

                        switch (type)
                        {
                        case 0:
                                message("vision", HIW "天空中传来隐隐的雷声"
                                        "，忽然电闪雷鸣，" + item->name() +
					HIW "腾空而起，"
                                        "消失不见！\n\n" NOR, env);
                                break;
                        case 1:
                                message("vision", HIC "一道神光从天而降"
                                        "，罩定了" + item->name() + HIC "，只见" +
					item->name() + HIC "化作长虹破空而"
					"走。\n\n" NOR, env);
                                break;
                        default:
                                message("vision", HIY "忽然间麝香遍地，氤氲弥漫，" +
                                        item->name() + HIY "叮呤呤的抖动数下，化作一"
					"道金光转瞬不见！\n\n" NOR, env);
                                break;
                        }

                        if (interactive(env = environment(item)))
                        {
                                tell_object(env, HIM + item->name() +
                                                 HIM "忽然离你而去了！\n" NOR);
                        }
                }

                switch (type)
                {
                case 0:
                        message_vision(HIW "一声" HIR "霹雳" HIW "，"
                                       "闪电划破长空，" + item->name() + HIW
                                       "从天而降，飞入$N" HIW "的手中！\n\n" NOR, me);
                        break;
                case 1:
                        if (me->query("id") == "ivy") break;

                        message_vision(HIW "一道" HIY "长虹" HIW "扫过"
                                       "天空，只见" + item->name() + HIW
					"落入了$N" HIW "的掌中！\n\n" NOR, me);
                        break;
                default:
                        message_vision(HIW "只见" + item->name() + HIW "呤呤作响，大"
                                       "放异彩，挟云带雾，突现在$N"
                                       HIW "的掌中！\n\n" NOR, me);
                        break;
                }
        }

        // 取消no_get属性
        item->delete_temp("stab_by");
        item->delete("no_get");

        item->move(me, 1);
        if (environment(item) != me)
                return 1;

        if (item->query("armor_type"))
        {
                // is armor
                temp = me->query_temp("armor/" + item->query("armor_type"));
                if (temp) temp->unequip();
                WEAR_CMD->do_wear(me, item);
        } else
        if (item->query("skill_type"))
        {
                if (temp = me->query_temp("weapon"))
                        temp->unequip();
                if (temp = me->query_temp("secondary_weapon"))
                        temp->unequip();
                WIELD_CMD->do_wield(me, item);
        }

        return 1;
}

// 隐藏物品
int hide_anywhere(object me, object item)
{
        if (item->item_owner() != me->query("id"))
                return 0;

        if (me->query("jingli") < 100)
        {
                tell_object(me, "你试图令" + item->name() +
                            "遁去，可是精力不济，难以发挥它的能力。\n");
                return 0;
        }
        me->add("jingli", -100);

        message_vision(HIM "$N" HIM "轻轻一旋" + item->name() +
                       HIM "，已然了无踪迹。\n" NOR, me);
        destruct(item);
        return 1;
}

// 追寻物品
int receive_miss(object me, object item)
{
        object env;

        env = environment(item);

        if (env == environment(me))
        {
                write("你瞪着" + item->name() + "，看啥？\n");
                return 0;
        }

        if (env == me)
        {
                write("你摸着" + item->name() + "，发了半天的呆。\n");
                return 0;
        }

        if (! objectp(env) || userp(env) || environment(env))
        {
                write("你试图感应" + item->name() + "，但是感觉非常的渺茫。\n");
                return 0;
        }

        if (! wizardp(me) && ! env->query("outdoors"))
        {
                write("冥冥中你感应到" + item->name() + "，但是似乎难以到达那里。\n");
                return 0;
        }

        message("vision", me->name() + "在凝神思索，不知道要做些什么。\n",
                environment(me), ({ me }));
        if (me->query("jingli") < 400)
        {
                write("你觉得" + item->name() + "的感觉相当"
                      "飘忽，看来精力不济，难以感应。\n");
                return 0;
        }

        // 消耗精力
        me->add("jingli", -300 - random(100));
        message_vision(HIM "$N" HIM "口中念念有词，转瞬天际一道长虹划"
                       "过，$N" HIM "驾彩虹而走。\n" NOR, me);
        tell_object(me, "你追寻" + item->name() + "而去。\n");
        me->move(environment(item));
        message("vision", HIM "一道彩虹划过天际，" + me->name() +
                HIM "飘然落下，有若神仙。\n" NOR, environment(me), ({ me }));
        tell_object(me, HIM "你追寻到了" + item->name() +
                    HIM "，落下遁光。\n" NOR);
        return 1;
}

// 插在地上
int do_stab(object me, object item)
{
        if (! item->is_weapon() && item->query("armor_type") != "hands")
                return notify_fail(item->name() + "也能插在地上？\n");

        if (! environment(me)->query("outdoors") &&
            ! wizardp(me))
                return notify_fail("在这里乱弄什么！\n");

        item->set("no_get", bind((: call_other, __FILE__, "do_get_item", item :), item));
        item->set_temp("stab_by", me->query("id"));

        message_vision(WHT "\n$N" WHT "随手将" + item->name() + NOR +
                       WHT "往地上一插，发出「嚓愣」一声脆响。\n\n" NOR, me);
        item->move(environment(me));
        return 1;
}

// 把取物品时检查
mixed do_get_item(object item)
{
        object me;

        if (! objectp(me = this_player()))
                return 1;

        if (me->query("id") != item->query_temp("stab_by") &&
            me->query("id") != item->item_owner())
                return "你试图将" + item->name() + "拔起，却"
                       "发现它仿佛是生长在这里一般，无法撼动。\n";

        message_vision(HIW "\n$N" HIW "随手拂过" + item->name() +
                       HIW "脊处，顿时只听「嗤」的一声，扬起一阵"
                       "尘土。\n\n" NOR, me);
        item->delete_temp("stab_by");
        item->delete("no_get");
        item->move(me, 1);
        return "";
}

// 发挥特殊功能
mixed do_touch(object me, object item)
{
        string msg;
        object ob;
        object *obs;
        mapping my;

        if (me->query("id") != item->item_owner())
        {
                message_vision(HIR "\n$N轻轻触碰" + item->name() +
                               HIR "，突然间全身一震，连退数步，如"
                               "遭受电击。\n" NOR, me);
                me->receive_damage("qi", 50 + random(50));
                return 1;
        }

        if (me->query("jingli") < 200)
        {
                me->set("jingli", 0);
                return notify_fail(CYN "\n你凝视" + item->name() +
                                   CYN "许久，悠悠一声长叹。\n" NOR);
        }

        switch (random(3))
        {
        case 0:
                msg = CYN "\n$N" CYN "轻轻一弹$n" CYN "，长吟"
                      "道：「别来无恙乎？」\n" NOR;
                break;
        case 1:
                msg = CYN "\n$N" CYN "轻轻抚过$n" CYN "，作古"
                      "风一首，$n" CYN "铃铃作响，似以和之。\n" NOR;
                break;
        default:
                msg = CYN "\n$N" CYN "悠然一声长叹，轻抚$n"
                      CYN "，沉思良久，不禁感慨万千。\n" NOR;
                break;
        }

        switch (random(3))
        {
        case 0:
                msg += HIM "忽然只见$n" HIM "闪过一道光华，"
                       "飞跃而起，散作千百流离。\n" NOR;
                break;
        case 1:
                msg += HIM "顿听$n" HIM "一声龙吟，悠悠不绝"
                       "，直沁入到你的心肺中去。\n" NOR;
                break;
        default:
                msg += HIM "霎时间$n" HIM "光芒四射，如蕴琉"
                       "璃异彩，逼得你难以目视。\n" NOR;
                break;
        }

        me->add("jingli", -150);
        msg = replace_string(msg, "$n", item->name());
        message_vision(msg, me);

        if (random(1000) == 1 || wizardp(me))
        {
                obs = filter_array(all_inventory(environment(me)), (: userp :));
                foreach (ob in obs)
                {
					    my = ob->query_entire_dbase();
                        my["jing"]   = my["eff_jing"] = my["max_jing"];
                        my["qi"]     = my["eff_qi"]   = my["max_qi"];
                        my["neili"]  = my["max_neili"];
                        my["jingli"] = my["max_jingli"];
                        ob->set_temp("nopoison", 1);
                }
                tell_object(obs, HIC "你感到一股温和的热浪袭来，便似"
                                "获得重生一般。\n" NOR);
        } else
        if (me->query("neili") < me->query("max_neili"))
        {
                me->set("neili", me->query("max_neili"));
                me->start_busy(1 + random(5));
                tell_object(me, HIC "你只觉一股热气至丹田冉冉升起，"
                                "说不出的舒服。\n" NOR);
        }
        return 1;
}

// 圣化物品
int do_san(object me, object item)
{
        string my_id;
        int count;
        int san;

        if (! item->query("skill_type") && item->query("armor_type") != "hands")
        {
                // 是装备类？
                return notify_fail("装备现在还无法圣化。\n");
        }

        // 武器类的圣化
        if (item->query("magic/power") > 0)
                return notify_fail("现在" + item->name() + "的威力"
                                   "已经得到了充分的发挥了。\n");

        if (item->query("magic/imbue_ok"))
                return notify_fail("现在" + item->name() + "的潜力"
                                   "已经充分挖掘了，现在只是需要最"
                                   "后一步融合。\n");

        my_id = me->query("id");

        count = sizeof(item->query("magic/do_san"));
        if (item->query("magic/imbue_ob"))
                return notify_fail("现在" + item->name() + "已经被充分的圣"
                                   "化了，需要浸入神物以进一步磨练。\n");

        if (item->query("magic/do_san/" + my_id))
                return notify_fail("你已经为" + item->name() + "圣化过了，"
                                   "非凡的能力还无法被它完全吸收。\n你"
                                   "有必要寻求他人帮助以继续圣化。\n");

        if (item->item_owner() == my_id)
        {
                if (! count)
                        return notify_fail("你应该先寻求四位高手协助你先行圣化" +
                                           item->name() + "。\n");

                if (count < SAN_PER_IMBUE - 1)
                        return notify_fail("你应该再寻求" +
                                           chinese_number(SAN_PER_IMBUE - 1 - count) +
                                           "位高手先行圣化" + item->name() + "。\n");
        } else
        {
                if (count >= SAN_PER_IMBUE - 1)
                        return notify_fail("最后需要剑的主人为它圣化，不劳你费心了。\n");
        }

        if (me->query("neili") < me->query("max_neili") * 9 / 10)
                return notify_fail("你现在内力并不充沛，怎敢贸然运用？\n");

        if (me->query("jingli") < me->query("max_jingli") * 9 / 10)
                return notify_fail("你现在精力不济，怎敢贸然运用？\n");

        if (me->query_skill("force") < 300)
                return notify_fail("你的内功根基不够扎实，不能贸然圣化。\n");

        if (me->query("max_neili") < 8000)
                return notify_fail("你尝试运了一下内力，无法顺"
                                   "利运足一个周天，难以施展你的能力。\n");

        if (me->query("max_jingli") < 1000)
                return notify_fail("你试图凝神运用精力，但是感觉尚有欠缺。\n");

        message_sort(HIM "\n$N" HIM "轻轻抚过$n" HIM "，两指点于其上，同"
                     "时运转丹田内力，经由奇经八脉源源由体内流出，注"
                     "入$n" HIM "。忽的只见氤氲紫气从$n" HIM
                     "上腾然升起，弥漫在四周。\n" NOR, me, item);

        if (me->query("max_neili") < me->query_neili_limit() - 400)
        {
                if (random(2) == 1)
                {
                        // 内力未满警告
                        message_vision(HIR "$N" HIR "脸色忽然变了变。\n" NOR,
                                       me);
                        tell_object(me, HIC "你忽然觉得丹田气息有些错乱。\n" NOR);
                } else
                {
                        message_vision(HIR "$N" HIR "忽然闷哼一声，脸"
                                       "上刹时大汗淋漓！\n" NOR, me);
                        tell_object(me, HIC "你感到可能是你的内力尚未锻炼"
                                    "到极至，结果损伤了你的内功根基。\n" NOR);
                        tell_object(me, HIC "你的基本内功下降了。\n");
                        me->set_skill("force", me->query_skill("force", 1) - 10 - random(5));
                        return 1;
                }
        }

        // 统计IMBUE过的次数，并用来计算本次MAX_NEILI/JINGLI的消耗
        san = item->query("magic/imbue");

        me->add("max_neili", -(san + 5));
        me->add("neili", -(san * 10 + 100));
        //me->add("max_jingli", -(san * 5 + 50));
        me->add("max_jingli", -(san + 5));
        me->add("jingli", -(san * 5 + 50));
        item->set("magic/do_san/" + my_id, me->name(1));
        me->start_busy(1);

        if (item->item_owner() == my_id)
        {
                tell_object(me, HIW "你凝神片刻，觉得" + item->name() +
                            HIW "似乎有了灵性，跳跃不休，不禁微微一笑。\n" NOR);
                message("vision", HIW + me->name() + HIW "忽然"
                        "微微一笑。\n" HIW, environment(me), ({ me }));

                // 选定一个需要imbue的物品
                item->set("magic/imbue_ob", imbue_list[random(sizeof(imbue_list))]);
        }
        return 1;
}

// 浸透物品
int do_imbue(object me, object item, object imbue)
{
        if (item->query("magic/power") > 0)
                return notify_fail("现在" + item->name() + "的威力"
                                   "已经得到了充分的发挥了。\n");

        if (item->query("magic/imbue_ok"))
                return notify_fail("现在" + item->name() + "的潜力"
                                   "已经充分挖掘了，现在只是需要最"
                                   "后一步融合。\n");

        if (sizeof(item->query("magic/do_san")) < SAN_PER_IMBUE)
                return notify_fail("你必须先对" + item->name() +
                                   "进行充分的圣化才行。\n");

        if (base_name(imbue) != item->query("magic/imbue_ob"))
                return notify_fail(item->name() + "现在不需要用" +
                                   imbue->name() + "来浸入。\n");

        message_sort(HIM "$N" HIM "深吸一口气，面上笼罩了一层白霜，只手握住$n" +
                     imbue->name() +
                     HIM "，忽然间融化在掌心，晶莹欲透！$N"
                     HIM "随手一挥，将一汪清液洒在$n" HIM
                     "上，登时化做雾气，须臾成五彩，奇光闪烁。\n" NOR,
                     me, item);

        tell_object(me, "你将" + imbue->name() + "的效力浸入了" +
                    item->name() + "。\n");
        item->delete("magic/do_san");
        item->delete("magic/imbue_ob");
        destruct(imbue);
        me->start_busy(1);

        item->add("magic/imbue", 1);
        if (random(item->query("magic/imbue")) >= RANDOM_IMBUE_OK)
        {
                // 浸透完成
                tell_object(me, HIG "你忽然发现手中的" + item->name() +
                            HIG "有一种跃跃欲试的感觉，似乎期待着什么。\n" NOR);
                item->set("magic/imbue_ok", 1);
        }

        return 1;
}

// 镶嵌物品
int do_enchase(object me, object item, object tessera)
{
        if (item->query("magic/power") > 0)
                return notify_fail("现在" + item->name() + "的威力"
                                   "已经得到了充分的发挥了。\n");

        if (! item->query("magic/imbue_ok"))
                return notify_fail("现在" + item->name() + "的潜力"
                                   "还没有充分的激发，未到镶嵌的时候。\n");

        if (! tessera->query("can_be_enchased"))
                return notify_fail(tessera->name() + "好象没"
                                   "法用来镶嵌吧。\n");

        if (! mapp(tessera->query("magic")))
                return notify_fail(tessera->name() + "不能发挥魔力，"
                                   "没有必要镶嵌在" + item->name() + "上面。\n");

        if (me->query_skill("certosina", 1) < 200)
                return notify_fail("你觉得你的镶嵌技艺还不够"
                                   "娴熟，不敢贸然动手。\n");

        message_sort(HIM "“喀啦”一声，$N" HIM "将" + tessera->name() +
                     HIM "镶嵌到了$n" HIM "上面，只间$n" HIM
                     "上隐隐的显过了一道奇异的光芒，随"
                     "即变得平静，说不出的平凡。\n" NOR, me, item);
        tell_object(me, HIC "你感受" + item->name() + HIC "发生了"
                    "不可言喻的变化。\n" NOR);
        item->set("magic/power", tessera->query("magic/power"));
       	item->set("magic/type", tessera->query("magic/type"));
        item->set("magic/tessera", tessera->name());
        item->add_weight(tessera->query_weight());
        item->save();
        destruct(tessera);

        // 发布消息
        CHANNEL_D->do_channel(this_object(), "rumor",
                              "听说神品" + item->name() + HIM +
                              "来到了人间。");

        me->start_busy(1);
        return 1;
}

// 10级兵器攻击对手
mixed weapon10lv_hit_ob(object me, object victim, object weapon, int damage_bonus)
{
        mapping magic;
        int jingjia;
        int power, resistance;
        int damage;
        string msg;

        // 计算魔法效果
        magic = weapon->query("magic");
        power = magic["power"];
        damage = 0;
        resistance = 0;
        //jingjia = me->query("jiajing");
        jingjia = me->query("jiali") / 3;

        switch (magic["type"])
        {
        case "lighting":
                // 闪电攻击：伤害内力++和气+
                resistance = victim->query_temp("apply/resistance/lighting");
                damage = (power + jingjia) * 200 / (100 + resistance);
                switch (random(3))
                {
                case 0:
                        msg = HIY + weapon->name() + HIY "迸发出几道明亮的闪光，兹兹作响，让$n"
                              HIY "不由为之酥麻。\n" NOR;
                        break;
                case 1:
                        msg = HIY "一道电光闪过，" + weapon->name() + HIY
                              "变得耀眼夺目，令$n" HIY "无法正视，心神俱废。\n" NOR;
                        break;
                default:
                        msg = HIY "天际隐隐响起几声闷雷，紧接着一道霹雳直下，" +
                              weapon->name() + HIY "忽明忽暗，五彩缤纷，震得$n"
                              HIY "酸软无力。\n" NOR;
                        break;
                }

                if (victim->query("neili") > damage)
                        victim->add("neili", -damage);
                else
                        victim->set("neili", 0);

                victim->receive_damage("qi", damage);
                victim->receive_wound("qi", damage / 4);
                break;

        case "cold":
                // 冷冻攻击：伤害精++和气+
                resistance = victim->query_temp("apply/resistance/cold");
                damage = (power + jingjia) * 200 / (100 + resistance);
                victim->receive_damage("jing", damage / 3);
                victim->receive_wound("jing", damage / 6);
                victim->receive_damage("qi", damage / 2);
                victim->receive_wound("qi", damage / 5);
                switch (random(3))
                {
                case 0:
                        msg = HIB + weapon->name() + HIB "闪过一道冷涩的蓝光，让$n"
                              HIB "不寒而栗。\n" NOR;
                        break;
                case 1:
                        msg = HIB "忽然间" + weapon->name() + HIB
                              "变得透体通蓝，一道道冰冷的寒光迸发出来，$n"
                              HIB "浑身只是一冷。\n" NOR;
                        break;
                default:
                        msg = HIB "一道光圈由" + weapon->name() + HIB "射出，"
                              "森然盘旋在$n" HIB "四周，悄然无息。\n" NOR;
                        break;
                }
                break;

        case "fire":
                // 火焰攻击：伤害精+和气++
                resistance = victim->query_temp("apply/resistance/fire");
                damage = (power + jingjia) * 300 / (100 + resistance);
                victim->receive_damage("jing", damage / 5);
                victim->receive_wound("jing", damage / 8);
                victim->receive_damage("qi", damage);
                victim->receive_wound("qi", damage / 2);
                switch (random(3))
                {
                case 0:
                        msg = HIR + weapon->name() + HIR "蓦的腾起一串火焰，将$n"
                              HIR "接连逼退了数步，惨叫连连。\n" NOR;
                        break;
                case 1:
                        msg = HIR "一道火光从" + weapon->name() + HIR
                              "上迸出，迅捷无伦的击中$n" HIR "，令人避无可避！\n" NOR;
                        break;
                default:
                        msg = HIR "一串串火焰从" + weapon->name() + HIR "上飞溅射出，"
                              "四下散开，接连击中$n" HIR "！\n" NOR;
                        break;
                }
                break;

        case "magic":
                // 魔法攻击：吸取气+
                resistance = victim->query_temp("apply/resistance/magic");
                damage = (power + jingjia) * 200 / (100 + resistance);
                victim->receive_damage("qi", damage);
                victim->receive_wound("qi", damage / 4);

                if (victim->query("neili") > damage)
                        victim->add("neili", -damage);
                else
                        victim->set("neili", 0);

                switch (random(3))
                {
                case 0:
                        msg = HIM + weapon->name() + HIM "响起一阵奇异的声音，犹如龙吟，令$n"
                              HIM "心神不定，神情恍惚。\n" NOR;
                        break;
                case 1:
                        msg = HIM "“啵”的一声，" + weapon->name() + HIM
                              "如击败革，却见$n" HIM "闷哼一声，摇晃不定！\n" NOR;
                        break;
                default:
                        msg = HIM + weapon->name() + HIM "上旋出一道道五彩缤纷的"
                              "光圈，笼罩了$n" HIM "，四下飞舞。\n" NOR;
                        break;
                }
                break;

        default:
                msg = "";
                break;
        }

        // 使用perform
        if (random(2)) return msg;
        damage = 200 + random(400);

        switch (random(6))
        {
        case 0:
                victim->receive_wound("jing", damage / 6 + random(damage / 6), me);
                return msg + HIM "$N" HIM "嘿然冷笑，抖动" + weapon->name() +
                       HIM "，数道光华一起射出，将$n" HIM "困在当中，无法自拔。\n" NOR;

        case 1:
                victim->receive_wound("jing", damage / 5 + random(damage / 5), me);
                return msg + HIC "$N" HIC "手中的" + weapon->name() + HIC "射出各种光芒，"
                       "眩目夺人，一道道神采映射得天地尽情失色，让$n"
                       HIC "目瞪口呆！\n" NOR;
        case 2:
                victim->receive_wound("qi", damage / 4 + random(damage / 4), me);
                return msg + HIY "$N" HIY "举起" + weapon->name() +
                       HIY "，只见天空一道亮光闪过，$n" HIY "连吐几口鲜血！\n" NOR;

        case 3:
                victim->receive_wound("qi", damage / 3 + random(damage / 3), me);
                return msg + HIG "$N" HIG "随手划动" + weapon->name() + HIG "，一圈圈碧芒"
                       "围向$n" HIG "，震得$n吐血连连！\n" NOR;

        case 4:
                victim->receive_wound("qi", damage / 2 + random(damage / 2), me);
                return msg + HIW "$N" HIW "一声长叹，" + weapon->name() + HIW "轻轻递出，"
                       "霎时万籁俱静，$n" HIW "只觉得整个人都跌进了地狱中去！\n" NOR;

        default:
                if (me->query_temp("weapon_performing"))
                        break;
                me->start_call_out(bind((: call_other, __FILE__, "continue_attack",
                                           me, victim, weapon, 10 + random(4) :), me), 0);
        }
}

// 9级兵器攻击对手
mixed weapon_hit_ob(object me, object victim, object weapon, int damage_bonus)
{
        //int ap;
        //int dp;
        int damage;

        if (random(2)) return;

        // 计算damage：不论是空手武器还是普通兵器，统一计算
        if (weapon->is_weapon())
                damage = me->query_temp("apply/damage");
        else
                damage = me->query_temp("apply/unarmed_damage");

        switch (random(8))
        {
        case 0:
                victim->receive_wound("jing", damage / 5 + random(damage / 5), me);
                return HIY "$N" HIY "抖动手中的" + weapon->name() + HIY
                       "，幻化成夜空流星，数道" HIM "紫芒" HIY "划破星"
                       "空袭向$n" HIY "。\n" NOR;
        case 1:
                victim->receive_wound("qi", damage / 3 + random(damage / 3), me);
                return HIR "$N" HIR "大喝一声，手中" + weapon->name() +
                       HIR "遥指$n" HIR "，一道杀气登时将$n" HIR "震退"
                       "数步。\n" NOR;
        case 2:
                victim->receive_wound("qi", damage / 6 + random(damage / 6), me);
                victim->receive_wound("jing", damage / 10 + random(damage / 10), me);
                return HIG "$N" HIG "蓦地回转" + weapon->name() + HIG
                       "，漾起层层碧波，宛若" NOR + HIB "星河" HIG "气"
                       "旋，将$n" HIG "圈裹其中。\n" NOR;
        case 3:
        case 4:
        case 5:
        case 6:
                break;

        default:
                if (me->query_temp("weapon_performing"))
                        break;
                me->start_call_out(bind((: call_other, __FILE__, "continue_attack",
                                           me, victim, weapon, 5 + random(4) :), me), 0);
        }
}

// 绝招：12连环攻击
void continue_attack(object me, object victim, object weapon, int times)
{
        int i;
        string msg;
        int ap, dp;

        if (! me || ! victim || ! weapon || ! me->is_fighting(victim))
                return;

        msg  = HIW "霎时只听$N" HIW "纵声长啸，人与" + weapon->name() +
               HIW "融为一体，霎时间寒芒飞散，向$n" HIW "射去。\n" NOR;

        ap = me->query_skill("martial-cognize",1);
        dp = victim->query_skill("parry",1);

        if (ap / 2 + random(ap) > dp * 3 / 4)
                msg += HIR "$n" HIR "大骇之下连忙后退，可已然不及闪避，慌乱"
                       "中不禁破绽迭出。\n" HIW "$N" HIW "盯住$n" HIW "招中"
                       "破绽，疾速旋转手中" + weapon->name() + HIW "，电光火"
                       "石间已朝$n" HIW "攻出" + chinese_number(times) + HIW
                       "招！\n" NOR;
        else
        {
                msg += CYN "可是$n" CYN "冥神抵挡，将$N"
                       CYN "此招的所有变化全然封住。\n" NOR;
                message_combatd(msg, me, victim);
                return;
        }
        message_combatd(msg, me, victim);

        me->set_temp("weapon_performing", 1);
        i = times;
        while (i--)
        {
                if (! me->is_fighting(victim))
                        break;

                if (! victim->is_busy() && random(2))
                        victim->start_busy(1);

                COMBAT_D->do_attack(me, victim, me->query_temp("weapon"), 0);
        }
        me->delete_temp("weapon_performing");
}

// 降低耐久度
void reduce_consistence(object item)
{
        int st;
        int con;

        st = item->query("stable");

        if (st < 2)
                return;

        con = item->query("consistence");

        // 寰宇天晶炼制的武器永不磨损
        if (item->query("material") == "tian jing")
                return;

        if (random(st) > (100 - con) / 7)
                return;

        if (item->add("consistence", -1) > 0)
                return;

        item->set("consistence", 0);

        if (environment(item))
                tell_object(environment(item), HIG "你的" +
                            item->name() + HIG "已经彻底损坏了。\n");

        item->unequip();
}

// 构造物品缺省的耐久度信息
void equip_setup(object item)
{
        int stable;
        mapping dbase;

        dbase = item->query_entire_dbase();
        if (undefinedp(dbase["consistence"]))
                dbase["consistence"] = 100;

        if (undefinedp(item->query("stable")))
        {
                switch (item->query("material"))
                {
                case "cloth":
                        // 永远不会损坏
                        stable = 0;
                        break;
                case "paper":
                        stable = 3;
                        item->set("no_repair", "这东西我可没法修理。\n");
                        break;
                case "bone":
                        stable = 8;
                        item->set("no_repear", "修理这个？可别拿我寻开心。\n");
                        break;
                case "bamboo":
                case "wood":
                        stable = 10;
                        item->set("no_repair", "这东西我咋修理？\n");
                        break;
                case "copper":
                        stable = 40;
                        break;
                case "silver":
                        stable = 40;
                        break;
                case "iron":
                        stable = 45;
                        break;
                case "gold":
                        stable = 50;
                        break;
                case "steel":
                        stable = 75;
                        break;
                case "stone":
                        stable = 80;
                        break;
                default:
                        stable = 100;
                        break;
                }

                if (! item->is_item_make())
                        stable /= 2;

                item->set("stable", stable);
        }
}
