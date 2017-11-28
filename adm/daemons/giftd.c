// giftd.c
// Written by Vin for Heros.cn 2002/07/14.

#include <ansi.h>
#include <quest.h>

inherit F_DBASE;
inherit F_CLEAN_UP;

// 定义提供给外部调用的接口函数
varargs public void bonus(object who, mapping b, int flag);
varargs public void freequest_bonus(object who);
varargs public void gift_bonus(object who, mapping b);
varargs public void work_bonus(object who, mapping b);
public void delay_bonus(object who, mapping b);
public void delay_freequest_bonus(object who);
public void delay_gift_bonus(object who, mapping b);
public void delay_work_bonus(object who, mapping b);

void create()
{
        seteuid(getuid());
        set("channel_id", "奖励精灵");
        set_heart_beat(900);
}

// 延迟奖励：因为有时给出奖励的时候应该是在某些事件发生以后，
// 但是在该事件发生时给与奖励更易于书写程序，所以奖励生成的
// 地方在事件正在发生的时候，但是要让玩家看起来是在事件发生
// 以后。比如杀人，人死亡的时候给与奖励是容易做的，但是我希
// 望玩家在看到NPC 的死亡信息以后才看到奖励的信息，这时候就
// 用delay_bonus了。

public void delay_bonus(object who, mapping b)
{
        who->start_call_out((: call_other, __FILE__,
                               "bonus", who, b :), 1);
}

public void delay_work_bonus(object who, mapping b)
{
        who->start_call_out((: call_other, __FILE__,
                               "work_bonus", who, b :), 1);
}

public void delay_freequest_bonus(object who)
{
        who->start_call_out((: call_other, __FILE__,
                               "freequest_bonus", who :), 3);
}

public void delay_gift_bonus(object who, mapping b)
{
        who->start_call_out((: call_other, __FILE__,
                               "gift_bonus", who, b :), 1);
}

// 自由任务的奖励
varargs public void bonus(object who, mapping b, int flag)
{
        int exp;                // 奖励的经验
        int pot;                // 奖励的潜能
        int mar;                // 奖励的实战体会
        int shen;               // 奖励的神
        int score;              // 奖励的江湖阅历
        int weiwang;            // 奖励的江湖威望
        int gongxian;           // 奖励的门派贡献
        int pot_limit;          // 潜能的界限
        int mar_limit;          // 实战体会的界限
        int percent;            // 奖励的有效百分比
        string msg;             // 奖励的描述信息
        string league_name;
        int weiwang2, league_weiwang;


        league_weiwang = who->query("league/set/weiwang");
        // 获得奖励的百分比
        percent = b["percent"];
        if (percent < 1 || percent > 100)
                percent = 100;

        exp = b["exp"] * percent / 100;
        pot = b["pot"] * percent / 100;
        mar = b["mar"] * percent / 100;
        shen = b["shen"] * percent / 100;
        score = b["score"] * percent / 100;
        weiwang = b["weiwang"] * percent / 100;
        gongxian = b["gongxian"] * percent / 100;

        // 玩家经验太高，削弱奖励。
        if (who->query("combat_exp") >= 3000000)
        {
                exp /= 8;
                pot /= 8;
                mar /= 8;
        } else
        if (who->query("combat_exp") >= 2000000)
        {
                exp /= 4;
                pot /= 4;
                mar /= 4;
        } else
        if (who->query("combat_exp") >= 1000000)
        {
                exp /= 2;
                pot /= 2;
                mar /= 2;
        }

        if (! flag)
        {
                pot_limit = who->query_potential_limit() - who->query("potential");
                if (pot > pot_limit) pot = pot_limit;
                if (pot < 1) pot = 0;

                mar_limit = who->query_experience_limit() - who->query("experience");
                if (mar > mar_limit) mar = mar_limit;
                if (mar < 1) mar = 0;
        } else
        {
                if (who->query_potential_limit() < who->query("potential"))
                        pot = 1 + random(2);

                if (who->query_experience_limit() < who->query("experience"))
                        mar = 1;
        }

        // 生成提示信息
        if (stringp(msg = b["prompt"]))
                msg = HIG + msg + HIG "，你获得了";
        else
                msg = HIG "通过这次锻炼，你获得了";

        if (exp > 0) msg += chinese_number(exp) + "点经验、";
        if (pot > 0) msg += chinese_number(pot) + "点潜能、";
        if (mar > 0) msg += chinese_number(mar) + "点实战体会、";
        if (shen > 0) msg += chinese_number(shen) + "点正神、";
        if (shen < 0) msg += chinese_number(-shen) + "点负神、";
        if (score > 0) msg += chinese_number(score) + "点江湖阅历、";

        if (stringp(league_name = who->query("league/league_name"))
            && league_weiwang)
        {                        
                if (weiwang > 0)
                {
                                                                  
                         weiwang2 = weiwang * league_weiwang / 100;
                         weiwang = weiwang - weiwang2;
                         if (weiwang <= 0 )weiwang = 0;
                         if (weiwang > 0)msg += chinese_number(weiwang) + "点江湖威望、";
                         msg += "你所在同盟的威望提升了" + chinese_number(weiwang2) + "点、";
                                        
                }

         }               
         else  if (weiwang > 0) msg += chinese_number(weiwang) + "点江湖威望、";

        msg += "能力得到了提升。\n" NOR;
        tell_object(who, sort_msg(msg));

        // bonus
        who->add("combat_exp", exp);
        who->add("potential", pot);
        who->add("experience", mar);
        who->add("shen", shen);
        who->add("score", score);
        who->add("weiwang", weiwang);
        if (weiwang2 > 0)LEAGUE_D->add_league_fame(league_name, weiwang2);
        who->add("gongxian", gongxian);
}

// 普通工作任务的奖励
varargs public void work_bonus(object who, mapping b, int flag)
{
        int exp;                // 奖励的经验
        int pot;                // 奖励的潜能
        int mar;                // 奖励的实战体会
        int shen;               // 奖励的神
        int score;              // 奖励的江湖阅历
        int weiwang;            // 奖励的江湖威望
        int gongxian;           // 奖励的门派贡献
        int pot_limit;          // 潜能的界限
        int mar_limit;          // 实战体会的界限
        int percent;            // 奖励的有效百分比
        string msg;             // 奖励的描述信息
        string league_name;
        int weiwang2, league_weiwang;


        league_weiwang = who->query("league/set/weiwang");
        // 获得奖励的百分比
        percent = b["percent"];
        if (percent < 1 || percent > 100)
                percent = 100;

        exp = b["exp"] * percent / 100;
        pot = b["pot"] * percent / 100;
        mar = b["mar"] * percent / 100;
        shen = b["shen"] * percent / 100;
        score = b["score"] * percent / 100;
        weiwang = b["weiwang"] * percent / 100;
        gongxian = b["gongxian"] * percent / 100;

        if (! flag)
        {
                pot_limit = who->query_potential_limit() - who->query("potential");
                if (pot > pot_limit) pot = pot_limit;
                if (pot < 1) pot = 0;

                mar_limit = who->query_experience_limit() - who->query("experience");
                if (mar > mar_limit) mar = mar_limit;
                if (mar < 1) mar = 0;
        } else
        {
                if (who->query_potential_limit() < who->query("potential"))
                        pot = 1 + random(2);

                if (who->query_experience_limit() < who->query("experience"))
                        mar = 1;
        }

        // 生成提示信息
        if (stringp(msg = b["prompt"]))
                msg = HIC "\n" + msg + HIC "，你获得了";
        else
                msg = HIC "\n通过这次锻炼，你获得了";

        if (exp > 0) msg += chinese_number(exp) + "点经验、";
        if (pot > 0) msg += chinese_number(pot) + "点潜能、";
        if (mar > 0) msg += chinese_number(mar) + "点实战体会、";
        if (shen > 0) msg += chinese_number(shen) + "点正神、";
        if (shen < 0) msg += chinese_number(-shen) + "点负神、";
        if (score > 0) msg += chinese_number(score) + "点江湖阅历、";

        if (stringp(league_name = who->query("league/league_name"))
            && league_weiwang)
        {                        
                if (weiwang > 0)
                {
                                                           
                      weiwang2 = weiwang * league_weiwang / 100;
                      weiwang = weiwang - weiwang2;
                      if (weiwang <= 0 )weiwang = 0;
                      if (weiwang > 0)msg += chinese_number(weiwang) + "点江湖威望、";
                      msg += "你所在同盟的威望提升了" + chinese_number(weiwang2) + "点、";
                                        
                }

        }             
        else  if (weiwang > 0) msg += chinese_number(weiwang) + "点江湖威望、";


        msg += "能力得到了提升。\n\n" NOR;
        tell_object(who, sort_msg(msg));

        // bonus
        who->add("combat_exp", exp);
        who->add("potential", pot);
        who->add("experience", mar);
        who->add("shen", shen);
        who->add("score", score);
        who->add("weiwang", weiwang);
        if (weiwang2 > 0)LEAGUE_D->add_league_fame(league_name, weiwang2);
        who->add("gongxian", gongxian);
}

// 中断性质自由任务的奖励
varargs public void freequest_bonus(object who)
{
        object gift;
        int quest;              // 当前任务数量
        int exp;                // 奖励的经验
        int pot;                // 奖励的潜能
        int mar;                // 奖励的实战体会
        string msg;             // 奖励的描述信息

        quest = who->query("quest_count");

        exp = random(quest) + 500;

        // 因为获得奖励较多且无法累及中断任务，所以暂时不做
        // 上限的限制。
        pot = random(quest / 2) + 250;
        mar = random(quest / 2) + 250;

        msg = HIC "\n你在这次的历练过程中，对武学似乎又"
              "有了新的突破。你获得了" +
              chinese_number(exp) + "点经验、" +
              chinese_number(pot) + "点潜能及" +
              chinese_number(mar) + "点实战体会。\n" NOR;

        tell_object(who, sort_msg(msg));

        // bonus
        who->add("combat_exp", exp);
        who->add("potential", pot);
        who->add("experience", mar);
        who->add("quest/freequest", -1);

        if (who->query("quest/freequest") < 1)
        {
                who->delete("quest");
                message_sort(HIW "\n正在这时，只见一位" +
                             who->query("family/family_name") +
                             "弟子急急忙忙赶到$N" HIW "身边，说"
                             "道：“原来你在这里啊，师傅正到处派"
                             "人找你呢。听说有要紧事交给你办，你"
                             "赶快回去吧！这个包裹是师傅让我转交"
                             "给你的。”\n" NOR, who);

                message_sort("\n" + who->query("family/family_name") +
                             "弟子拿出一个包裹递给$N。\n\n" +
                             who->query("family/family_name") +
                             "弟子急急忙忙地离开了。\n" NOR, who);

                gift = new("/clone/fam/bag");
                gift->move(who, 1);
        }
}

// 特殊事件的奖励
varargs public void gift_bonus(object who, mapping b)
{
        int exp;                // 奖励的经验
        int pot;                // 奖励的潜能
        int mar;                // 奖励的实战体会
        int score;              // 奖励的江湖阅历
        int weiwang;            // 奖励的江湖威望
        int gongxian;           // 奖励的门派贡献
        int percent;            // 奖励的有效百分比
        string msg;             // 奖励的描述信息
        string temp;            // 进程记录信息
        int league_weiwang;     // 分给同盟的威望百分比
        int weiwang2;           // 同盟因该得的威望点
        string league_name;

        league_weiwang = who->query("league/set/weiwang");

        // 获得奖励的百分比
        percent = b["percent"];

        if (percent < 1 || percent > 100)
                percent = 100;

        // 进程记录，针对第一次完成有奖励的情节
        temp = b["temp"];

        exp = b["exp"] * percent / 100;
        pot = b["pot"] * percent / 100;
        mar = b["mar"] * percent / 100;
        score = b["score"] * percent / 100;
        weiwang = b["weiwang"] * percent / 100;
        gongxian = b["gongxian"] * percent / 100;

        // 生成谣言信息
        if (stringp(msg = b["rumor"]))
        {
                shout(HIR "【武林传闻】" NOR + WHT "听说" +
                      who->name() + WHT "[" + who->query("id") +
                      WHT "]" + msg + WHT "。\n" NOR);
        }

        if (! stringp(temp) || ! who->query(temp))
        {
                // 生成提示信息
                if (stringp(msg = b["prompt"]))
                        msg = HIW "\n" + msg + HIW "，你获得了";
                else
                        msg = HIW "\n通过此次经历，你获得了";

                // 记录下进程
                if (stringp(temp))
                        who->add(temp, 1);

                if (exp > 0) msg += chinese_number(exp) + "点经验、";
                if (pot > 0) msg += chinese_number(pot) + "点潜能、";
                if (mar > 0) msg += chinese_number(mar) + "点实战体会、";
                if (score > 0) msg += chinese_number(score) + "点江湖阅历、";
                if (gongxian > 0) msg += chinese_number(gongxian) + "点门派贡献、";

                if (stringp(league_name = who->query("league/league_name"))
                    && league_weiwang)
                {                        
                        if (weiwang > 0)
                        {
                                                                  
                                 weiwang2 = weiwang * league_weiwang / 100;
                                 weiwang = weiwang - weiwang2;
                                 if (weiwang <= 0 )weiwang = 0;
                                 if (weiwang > 0)msg += chinese_number(weiwang) + "点江湖威望、";
                                 msg += "你所在同盟的威望提升了" + chinese_number(weiwang2) + "点、";
                                        
                        }

                }
                
                else  if (weiwang > 0) msg += chinese_number(weiwang) + "点江湖威望、";
                msg += "能力得到了提升。\n" NOR;
                tell_object(who, sort_msg(msg));

                // bonus
                who->add("combat_exp", exp);
                who->add("potential", pot);
                who->add("experience", mar);
                who->add("score", score);
                who->add("weiwang", weiwang);
                if (weiwang2 > 0)LEAGUE_D->add_league_fame(league_name, weiwang2);
                who->add("gongxian", gongxian);
        }
}

