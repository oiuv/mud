// masterd.c 
// Written by Vin for Heros.cn 2002/07/13.

#include <ansi.h>
inherit F_DBASE;

// 定义提供给外部调用的接口函数
public mixed teach_pfm(object who, object ob, mapping b);
public mixed give_item(object who, object ob, mapping b);

// 对应下面的提升 skills 的可激发技能
string *valid_types = ({
        "force",
        "dodge",
        "unarmed",
        "cuff",
        "strike",
        "finger",
        "hand",
        "claw",
        "sword",
        "blade",
        "staff",
        "hammer",
        "club",
        "whip",
        "dagger",
        "throwing",
        "parry",
        "magic",
        "medical",
        "poison",
        "chuixiao-jifa",
        "tanqin-jifa",
        "guzheng-jifa",
        "cooking",
});

// 传授武功绝招
public mixed teach_pfm(object who, object ob, mapping b)
{
        string name, perform;           // 绝招名称及绝招进程记录
        int i;                          // 导入主要技能升级的循环符
        string msg;                     // 对于某些返回信息的描述
        string msg1, msg2;              // 显示出的信息及回答信息
        string sk1, sk2, sk3, sk4, sk5; // 所需要的武功名称
        int lv1, lv2, lv3, lv4, lv5;    // 所对应的武功等级
        int free;                       // 与下面的门派所对应，如果设置该参数，则
                                        // 无须考虑传授者与被传授者的门派是否一致
        string family;                  // 传授者的门派，如果不设置公共参数，则要
                                        // 传授双方的门派为同一门派
        int gongxian, shen;             // 需求的贡献及神
        int force, dodge;               // 需求的内功等级与轻功等级
        int neili, jingli;              // 需求的最大内力与最大精力
        string temp1, temp2, temp3;     // 要求的进程记录
        string tmsg1, tmsg2, tmsg3;     // 要求的进程记录的回答信息

        // 如果没有指明对象，则返回
        if (! stringp(name = b["name"])
           || ! stringp(perform = b["perform"]))
                return 0;

        // 判断所属门派，如为公共传授，应添加 free 参数
        if (! intp(free = b["free"]) || free <= 0)
        {
                family = ob->query("family/family_name");

                if (who->query("family/family_name") != family)
                        return RANK_D->query_respect(who) + "与我" +
                               family + "素无渊源，不知此话从何说起。";
        }

        // 如果已经学会，则返回
        if (who->query(perform))
        {
                switch (random(4))
                {
                case 0 :
                        msg = "自己下去练，还来罗嗦什么。";
                        break;

                case 1 :
                        msg = "我不是已经教过你了么？自己下去练。";
                        break;

                case 2 :
                        msg = "我能教的都教给你了，剩下的你自己领悟吧。";
                        break;

                default :
                        msg = "这招你不是已经会了么，还缠着我做甚？";
                        break;
                }
                return msg;
        }

        // 判断正神或负神的要求
        if (intp(shen = b["shen"]))
        {
                // 如果要求为负神，则作出大于判断
                if (shen < 0 && who->query("shen") > shen)
                        return "哼！像你这样的心慈手软之辈，又"
                               "能干成什么大事？";

                // 如果要求为正神，则作出小于判断
                if (shen > 0 && who->query("shen") < shen)
                        return "你目前所做的侠义正事不够，这招"
                               "暂时还不能传你。";
        }

        // 判断门派贡献的要求
        if (intp(gongxian = b["gongxian"])
           && who->query("gongxian") < gongxian)
                return "你为" + who->query("family/family_name") +
                       "作出的贡献不够，这招暂时还不能传你。";

        // 判断特定的进程记录要求
        if (stringp(temp1 = b["temp1"]) && ! who->query(temp1))
        {
                if (stringp(tmsg1 = b["tmsg1"]))
                        return tmsg1;
                else
                        return "现在某些机缘未到，这招我暂时还"
                               "不能传给你。";
        }

        if (stringp(temp2 = b["temp2"]) && ! who->query(temp2))
        {
                if (stringp(tmsg2 = b["tmsg2"]))
                        return tmsg2;
                else
                        return "现在某些机缘未到，这招我暂时还"
                               "不能传给你。";
        }

        if (stringp(temp3 = b["temp3"]) && ! who->query(temp3))
        {
                if (stringp(tmsg3 = b["tmsg3"]))
                        return tmsg3;
                else
                        return "现在某些机缘未到，这招我暂时还"
                               "不能传给你。";
        }

        // 判断特定的武功需求，其中 sk1 应为主 skills 
        if (stringp(sk1 = b["sk1"]) && intp(lv1 = b["lv1"]))
        {
                if (who->query_skill(sk1, 1) <= 0)
                        return "你连" + to_chinese(sk1) + "都"
                               "未曾学过，何谈绝招可言？";

                if (who->query_skill(sk1, 1) < lv1)
                        return "你对" + to_chinese(sk1) + "的"
                               "了解还不够，尚且无法领悟此招。";
        }

        if (stringp(sk2 = b["sk2"]) && intp(lv2 = b["lv2"])
           && who->query_skill(sk2, 1) < lv2)
                return "你对" + to_chinese(sk2) + "的了解还不"
                       "够，尚且无法领悟此招。";

        if (stringp(sk3 = b["sk3"]) && intp(lv3 = b["lv3"])
           && who->query_skill(sk3, 1) < lv3)
                return "你对" + to_chinese(sk3) + "的了解还不"
                       "够，尚且无法领悟此招。";

        if (stringp(sk4 = b["sk4"]) && intp(lv4 = b["lv4"])
           && who->query_skill(sk4, 1) < lv4)
                return "你对" + to_chinese(sk4) + "的了解还不"
                       "够，尚且无法领悟此招。";

        if (stringp(sk5 = b["sk5"]) && intp(lv5 = b["lv5"])
           && who->query_skill(sk5, 1) < lv5)
                return "你对" + to_chinese(sk5) + "的了解还不"
                       "够，尚且无法领悟此招。";

        // 判断绝招对内功的要求
        if (intp(force = b["force"])
           && force > 0
           && who->query_skill("force") < force)
                return "你目前的内功火候不足，下去练练再来吧。";

        // 判断绝招对轻功的要求
        if (intp(dodge = b["dodge"])
           && dodge > 0
           && who->query_skill("dodge") < dodge)
                return "你目前的轻功火候不足，下去练练再来吧。";

        // 判断绝招对内力上限的要求
        if (intp(neili = b["neili"])
           && neili > 0
           && who->query("max_neili") < neili)
                return "你现在的内力修为不足，修炼高点再来吧。";

        // 判断绝招对精力上限的要求
        if (intp(jingli = b["jingli"])
           && jingli > 0
           && who->query("max_jingli") < jingli)
                return "你现在的精力修为不足，修炼高点再来吧。";

        // 给予学习绝招的描述信息
        if (stringp(msg1 = b["msg1"]))
        {
                msg = msg1;
        } else
        {
                switch (random(4))
                {
                case 0 :
                        msg = "$N微微点了点头，伸手将$n" HIY "招"
                              "至身前，低声在$n" HIY "耳畔讲述了"
                              "半天，还不时伸手比划演示着什么，所"
                              "讲全是" + to_chinese(sk1) + "的精"
                              "微要诣。$n" HIY "听后会心一笑，看"
                              "来对$N的教导大有所悟。";
                        break;

                case 1 :
                        msg = "$N凝视了$n" HIY "许久，方才微微点"
                              "了点头，说道：“我给你演示一遍，可"
                              "看清楚了。”$N话音刚落，随即起身而"
                              "立拉开架势，慢慢的演示开" +
                              to_chinese(sk1) + "的招式。$n" HIY
                              "只觉$N招式精奇，神妙非凡，实乃前所"
                              "未闻，顿时大有感悟。";
                        break;

                case 2 :
                        msg = "$N看了看$n" HIY "，颇为赞许的说道"
                              "：“想不到你的" + to_chinese(sk1) +
                              "进展如此神速，已达此般境界。不易，"
                              "不易。今日我便传你这招，可记清楚了"
                              "。”说完$N便将$n" HIY "招至跟前，"
                              "耐心讲述" + name + "的诸多精要，$n"
                              HIY "一边听一边不住的点头。";
                        break;

                default :
                        msg = "$N哈哈一笑，对$n" HIY "赞道：“不"
                              "错，不错。依照你现在" +
                              to_chinese(sk1) + "的造诣，我便传授"
                              "你" + name + "又有何妨？”说完便只"
                              "见$N从怀中摸出一本颇为古旧的小册子"
                              "，指着其中一段对$n" HIY "仔细讲解"
                              "。$n" HIY "听后沉思良久，若有所悟。";
                        break;
                }
        }
        message_sort(HIY "\n" + msg + "\n\n" NOR, ob, who);

        // 学会该项绝招
        who->add(perform, 1);

        // 给予提示信息
        tell_object(who, HIC "你学会了「" HIW + name +
                         HIC "」。\n" NOR);

        // 提升相对应的武功技能
        if (stringp(sk1) && who->can_improve_skill(sk1))
                who->improve_skill(sk1, 1500000);

        if (stringp(sk2) && who->can_improve_skill(sk2))
                who->improve_skill(sk2, 1500000);

        if (stringp(sk3) && who->can_improve_skill(sk3))
                who->improve_skill(sk3, 1500000);

        if (stringp(sk4) && who->can_improve_skill(sk4))
                who->improve_skill(sk4, 1500000);

        if (stringp(sk5) && who->can_improve_skill(sk5))
                who->improve_skill(sk5, 1500000);

        // 提升主 skill 的基本技能
        for (i = 0; i < sizeof(valid_types); i++)
        {
                if (SKILL_D(sk1)->valid_enable(valid_types[i])
                   && who->can_improve_skill(valid_types[i]))
                        who->improve_skill(valid_types[i], 1500000);
        }

        // 提升武学修养等级
        who->improve_skill("martial-cognize", 3500000);

        // 消耗门派贡献值
        if (intp(gongxian) && gongxian > 0)
                who->add("gongxian", -gongxian);

        tell_object(who, "\n");

        // 最后的回答信息
        if (stringp(msg2 = b["msg2"]))
        {
                msg = msg2;
        } else
        {
                // 最后的回答信息
                switch (random(5))
                {
                case 0 :
                        msg = "刚才的招式，你明白了多少？";
                        break;

                case 1 :
                        msg = "招式便是如此，你自己下去领悟吧。";
                        break;

                case 2 :
                        msg = "刚才我所传授的全是该招的精意，可记牢了。";
                        break;

                case 3 :
                        msg = "这招你下去后需勤加练习，方能运用自如。";
                        break;

                default :
                        msg = "这招其实并不复杂，你自己下去练习吧。";
                        break;
                }
        }
        return msg;
}

// 物件的发放
public mixed give_item(object who, object ob, mapping b)
{
        object obj, owner;              // 给予的物品及拥有者
        string item;                    // 给予物品的 base_name
        string msg;                     // 对于某些返回信息的描述
        string sk1, sk2, sk3;           // 所需要的武功名称
        int lv1, lv2, lv3;              // 所对应的武功等级
//      int free;                       // 是否为公共物品派送
        int master;                     // 是否只有直属弟子才能领取
        int generation;                 // 门派中的辈份要求
        string family;                  // 给予物品者的门派
        int gongxian, shen;             // 需求的贡献及神
        string temp1, temp2, temp3;     // 要求的进程记录
        string tmsg1, tmsg2, tmsg3;     // 要求的进程记录的回答信息

        // 如果没有指明对象，则返回
        if (! stringp(item = b["item"]))
                return 0;

        // 判断所属门派，如为公共应添加 free 参数
        //if (! intp(free = b["free"]) || free <= 0)
        //{
                family = ob->query("family/family_name");

                if (who->query("family/family_name") != family)
                        return RANK_D->query_respect(who) + "与我" +
                               family + "素无渊源，不知此话从何说起。";
        //}

        // 查找对应的 base_name 呼出物件
        obj = find_object(item);

        if (! obj)
                obj = load_object(item);

        if (! obj)
                return "那东西出了点问题，你最好找巫师商量商量。";

        // 判断师承，如添加 master 参数，则只有直属弟子才能领取
        if (intp(master = b["master"])
           && master > 0
           && who->query("family/master_id") != ob->query("id"))
                return "只有我的弟子才配使用" + obj->name() + CYN
                       "，你还是走吧。" NOR;

        // 判断门派辈份，如果添加 master 参数，则应作缺省
        if (intp(generation = b["gen"])
           && generation > 0
           && who->query("family/generation") > generation)
                return "凭你在" + who->query("family/family_name") +
                       "中的地位，还不足以让我将" + obj->name() + CYN
                       "交予你。" NOR;

        // 判断正神或负神的要求
        if (intp(shen = b["shen"]))
        {
                // 如果要求为负神，则作出大于判断
                if (shen < 0 && who->query("shen") > shen)
                        return "哼！像你这样的心慈手软之辈，就"
                               "算拿着" + obj->name() + CYN "也"
                               "是无用。" NOR;

                // 如果要求为正神，则作出小于判断
                if (shen > 0 && who->query("shen") < shen)
                        return "你目前所做的侠义正事不够，这" +
                               obj->name() + CYN "暂时还不能交"
                               "给你。" NOR;
        }

        // 判断特定的进程记录要求
        if (stringp(temp1 = b["temp1"]) && ! who->query(temp1))
        {
                if (stringp(tmsg1 = b["tmsg1"]))
                        return tmsg1;
                else
                        return "现在某些机缘未到，这" + obj->name() +
                               CYN "暂时还不能交给你。" NOR;
        }

        if (stringp(temp2 = b["temp2"]) && ! who->query(temp2))
        {
                if (stringp(tmsg2 = b["tmsg2"]))
                        return tmsg2;
                else
                        return "现在某些机缘未到，这" + obj->name() +
                               CYN "暂时还不能交给你。" NOR;
        }

        if (stringp(temp3 = b["temp3"]) && ! who->query(temp3))
        {
                if (stringp(tmsg3 = b["tmsg3"]))
                        return tmsg3;
                else
                        return "现在某些机缘未到，这" + obj->name() +
                               CYN "暂时还不能交给你。" NOR;
        }

        // 判断特定的武功需求
        if (stringp(sk1 = b["sk1"]) && intp(lv1 = b["lv1"]))
        {
                if (who->query_skill(sk1, 1) <= 0)
                        return "你连" + to_chinese(sk1) + "都未曾"
                               "学过，拿" + obj->name() + CYN "又"
                               "有何用？" NOR;

                if (who->query_skill(sk1, 1) < lv1)
                        return "你的" + to_chinese(sk1) + "火候未"
                               "到，就算拿着" + obj->name() + CYN
                               "也没用。" NOR;
        }

        if (stringp(sk2 = b["sk2"]) && intp(lv2 = b["lv2"]))
        {
                if (who->query_skill(sk2, 1) <= 0)
                        return "你连" + to_chinese(sk2) + "都未曾"
                               "学过，拿" + obj->name() + CYN "又"
                               "有何用？" NOR;

                if (who->query_skill(sk2, 1) < lv2)
                        return "你的" + to_chinese(sk2) + "火候未"
                               "到，就算拿着" + obj->name() + CYN
                               "也没用。" NOR;
        }

        if (stringp(sk3 = b["sk3"]) && intp(lv3 = b["lv3"]))
        {
                if (who->query_skill(sk3, 1) <= 0)
                        return "你连" + to_chinese(sk3) + "都未曾"
                               "学过，拿" + obj->name() + CYN "又"
                               "有何用？" NOR;

                if (who->query_skill(sk3, 1) < lv3)
                        return "你的" + to_chinese(sk3) + "火候未"
                               "到，就算拿着" + obj->name() + CYN
                               "也没用。" NOR;
        }

        // 寻找该物件的所有者
	owner = environment(obj);
        while (owner)
	{
                if (owner->is_character() || ! environment(owner))
                        break;

		owner = environment(owner);
	}

        if (owner == who)
                return "那" + obj->query("unit") + obj->name() +
                       CYN "不就是你拿着在用么，怎么反倒找我"
                       "来了？" NOR;

        if (objectp(owner) && owner != ob)
        {
                if (! owner->is_character())
                        return "那" + obj->query("unit") + obj->name() +
                               CYN "我已经借出去了，你还是隔段时间再"
                               "来吧。" NOR;

                if (owner->query("family/family_name") == family)
                        return "那" + obj->query("unit") + obj->name() +
                               CYN "现在是我派的" + owner->name() +
                               "在用，你若需要就去找他吧。" NOR;
                else
                if (owner->query("family/family_name") == who->query("family/family_name"))
                        return "那" + obj->query("unit") + obj->name() +
                               CYN "现在是你派的" + owner->name() +
                               "在用，你自己去问他要吧。" NOR;
                else
                        return "那" + obj->query("unit") + obj->name() +
                               CYN "现在落在了" + owner->name() +
                               "手中，你去把它取回来吧。" NOR;
        }

        // 判断门派贡献的要求
        if (intp(gongxian = b["gongxian"])
           && gongxian > 0
           && who->query("gongxian") < gongxian)
                return "你为" + who->query("family/family_name") +
                       "作出的贡献不够，这" + obj->name() + CYN
                       "暂时还不能交给你。" NOR;

        // 物件转移，给予出提示信息
        message_vision("$N拿出" + obj->name() + "(" +
                       obj->query("id") + ")给$n。\n" NOR, ob, who);
        obj->move(who, 1);

        // 消耗门派贡献值
        if (intp(gongxian) && gongxian > 0)
                who->add("gongxian", -gongxian);

        // 最后的回答提示信息
        if (! stringp(msg = b["msg"]))
                msg = "既然这样，那这" + obj->query("unit") +
                      obj->name() + CYN "你就暂时拿去吧。" NOR;

        return msg;
}