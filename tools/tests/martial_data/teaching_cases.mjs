// Source-reviewed teaching conditions, not execution results. Actual records
// are collected by the shared runner and validated independently.
import assert from 'node:assert/strict';
import { readFileSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { isInside, sha256 } from './inventory.mjs';
import { learningSources, hongLearningConditions } from './hong_learning_cases.mjs';
import { chenLearningSources, chenLearningConditions } from './chen_learning_cases.mjs';
import { meizhuangIntroductionConditions } from './meizhuang_intro_cases.mjs';
import { shangLetterSources, shangLetterConditions } from './shang_letter_cases.mjs';
import { fengSources, fengTeachingConditions } from './feng_teaching_cases.mjs';
import { quanzhenLearningConditions, quanzhenLearningSources } from './quanzhen_learning_cases.mjs';
import { wudangTeachingConditions, wudangLearningSources } from './wudang_learning_cases.mjs';
import { shaolinTeachingConditions, shaolinLearningSources } from './shaolin_learning_cases.mjs';
import { shaolinTeachersConditions, shaolinTeachersSources } from './shaolin_teachers_cases.mjs';
import { shaolinRecruitConditions, shaolinRecruitSources } from './shaolin_recruit_cases.mjs';
import { shaolinPromotionConditions, shaolinPromotionSources } from './shaolin_promotion_cases.mjs';
import { shaolinTonsureConditions, shaolinTonsureSources } from './shaolin_tonsure_cases.mjs';
import { shaolinFormationConditions, shaolinFormationSources } from './shaolin_formation_cases.mjs';
import { shaolinChallengeConditions, shaolinChallengeSources } from './shaolin_challenge_cases.mjs';
import { shaolinChallengeFailureConditions } from './shaolin_challenge_failure_cases.mjs';
import { emeiTeachersConditions, emeiTeachersSources } from './emei_teachers_cases.mjs';
import { emeiRecruitConditions, emeiRecruitSources } from './emei_recruit_cases.mjs';
import { emeiSpecialConditions, emeiSpecialSources } from './emei_special_cases.mjs';
import { emeiTonsureConditions, emeiTonsureSources } from './emei_tonsure_cases.mjs';
import { gumuTeachersConditions, gumuTeachersSources } from './gumu_teachers_cases.mjs';
import { gumuSpecialTeachingConditions, gumuSpecialTeachingSources } from './gumu_special_teaching_cases.mjs';
import { gumuAcquisitionLearningConditions, gumuAcquisitionLearningSources } from './gumu_acquisition_learning_cases.mjs';
import { gumuItemAcquisitionConditions, gumuItemAcquisitionSources } from './gumu_item_acquisition_cases.mjs';
import { gumuRecruitConditions, gumuRecruitSources } from './gumu_recruit_cases.mjs';

const reviewed = {
    'kungfu/class/ouyang/ouyangfeng.c': '8a049f7c31f5cdd612dd90f9e9e187e3eeb23e6563be841abb4c694def14427b',
    'kungfu/class/ouyang/ouyang.h': '033e42433f0656f8f79262e832f05c902b277dbab88dfe83d20ecb1125e1988b',
    'kungfu/class/shang/ming.c': 'bf7511f6cad2e3b5f66cbe1faa331a2900b2e1b82d0addce219f610d0d7f2392',
    'kungfu/class/shang/tai.c': 'd42316ea5c95c4b8f2b7b765a92ccb837ef90a1505687512a780743257239a66',
    'kungfu/class/shang/shang.h': '20c42c5e63b8a5dab1314f21ada672a746f93428f0d7ed66d34c6b86a3468ade',
    'kungfu/class/zhenyuan/wangjianjie.c': 'a1e511ea15f3b951475a82e6dfc54edef237858ec47cc16f7d9e4d076e0f4256',
    'kungfu/class/zhenyuan/wangjianying.c': 'ff301e9edd640bc2e637cec0048ce9e77dd7eecba51450d5c89852e00ed263b5',
    'kungfu/class/zhenyuan/wangweiyang.c': '373590ff60bb30c82418d6e26fb3da70f31601c423b282504d69b7b91dbe35fb',
    'kungfu/class/zhenyuan/zhenyuan.h': 'c52c1a3764f42956049f5626bb8ddbf99889a34cf0eec2203484ddb9882149e5',
    'kungfu/class/miao/miao.c': 'acf54cc38b0713d8daa568b7a7967d49b987b8cc37c800613b96b9ea1a36fa2a',
    'kungfu/class/miao/miao.h': '337c67f0bb3d83728f15455c936384f0d5f95618545a0a000fa56cf3aba69eeb',
    'kungfu/class/murong/longcheng.c': 'be6b44ee8fa0b362e43d22548f5fa404ab179627b29dbeb781ca41f65c72b069',
    'kungfu/class/murong/murongbo.c': '62fafa908fbfa57973317f05eda6ef72ba96094e68f2560370cdd4b3b30d7be5',
    'kungfu/class/murong/murongfu.c': '9598c235daed3a3b475a0124c485d2c59c70fad45f5e171b2e66dc8f0658e2db',
    'kungfu/class/murong/murong.h': '923d19ba3d56a82d25cfa7faf40ea0ced9461c448e1acf248bf82f0f011c9159',
    'kungfu/class/lingjiu/duanmu.c': '83e7a4b38e69bfe1084ed8fc888b59e6d0ad3c862312613ac2e2c74b12157e60',
    'kungfu/class/lingjiu/li.c': '10498937dbc7d852f8abc00a5dc8e6870553efd3e6009863e90be39cc520eba9',
    'kungfu/class/lingjiu/sang.c': '9dbe09e7514fad1a02d54853939778897fe8e54af365ece17a6ddaa861070868',
    'kungfu/class/lingjiu/zhuo.c': '711d54cbcc62708b2e97a206077011c72f3125545134421ab060c7edadb53f3a',
    'kungfu/class/lingjiu/zuo.c': 'bcf89bb12585e7d8609576f16f859985eca1b361dc46f2601b0df1503062af10',
    'kungfu/class/lingjiu/xuzhu.c': '4edfc5cb83310de8c38eb6b7adbb5aadc6579e23b9db93ec1dba059a64230a89',
    'kungfu/class/lingjiu/etc.h': '80cfeee003a5962e90dda6fcf093cec843a67813aa57a5eea20cd42c561824b7',
    'kungfu/class/lingjiu/lingjiu.h': '1f49fadab53bce55d90855366497518b709d80bf39014d41c86ae7a8295a26be',
    'kungfu/class/xiaoyao/suxingh.c': '3d0b2717d58f40fa46b87735ed250682fd8ceed7558046698459794ec5ed5707',
    'kungfu/class/xiaoyao/wuyazi.c': 'fcd96c510e7aa3cfea374ff0bbd8deb09a070e5bb1b86ec1107ff43cf2340e45',
    'kungfu/class/xiaoyao/xiaoyao.h': '47a67402aeb574182b4ad4b5c6bfbf5d1ab6d1bdc1f4df40b4b53d5a6904abe9',
    'kungfu/class/lingxiao/baiwanjian.c': '833d7ba38c591345bb5e1f081aeb6882a70a23253c62891fd2f48e6879b67e85',
    'kungfu/class/lingxiao/baizizai.c': '0d34aa2ea28e59bdd9b630dad4c635745a4e1670258e65568331bab598735920',
    'kungfu/class/lingxiao/shipopo.c': '25c5f7436c27297bcd88def103cc7931dddceb83d7f825608e50cca97b7925d0',
    'kungfu/class/lingxiao/shiqing.c': '8e08f2811bde0beffe97cdb8ff8adfe27c9d230e37625624eaba36d80cd2e280',
    'kungfu/class/lingxiao/lingxiao.h': 'eec53bdb08984b90176c44c6a15c68671fb12a35246b7babd4b322655cf5fdca',
    'kungfu/class/meizhuang/danqing.c': 'd3fce9a43e9db2a37e0de2a82be60c24aef2853af7f3d41960e903ec603f5f18',
    'kungfu/class/meizhuang/ding.c': '2a1b05b2ea84330ed47e12cbd9e421eccd311675789f84b1ef971110d8ad86b6',
    'kungfu/class/meizhuang/heibai.c': '3dd013a7d80d6b37f8261c4bda7010cd0e55e3bd7f7ce2430f54192ac7dc7284',
    'kungfu/class/meizhuang/huang.c': 'd299803e1c478fe23d4b9a44a84ba16063f8f99c1da9bd1d7e5cf99567c07c5c',
    'kungfu/class/meizhuang/meizhuang.h': 'e5f4b9b8a17560e015c489382e70aaec7c9160a3b742dc76242a7d988db8fdd2',
    'kungfu/class/meizhuang/tubi.c': '9d6d19b94bc47c62c4f86bbededdef35548eee1b912b746ee11535eee8c9dabc',
    'kungfu/class/henshan/henshan.h': '543291f5e851a7935e080e5f5b776c6a9c6bf3aa45df48bea13b01ee4288404b',
    'kungfu/class/henshan/liu.c': '6f52e546e0b2d9a8b942c789923c6d6f52ea313d5964861b49dc445a8b516c6b',
    'kungfu/class/henshan/lu.c': '236d9c18279d86ca0301081445746543893e0f70a5315e9da8e1f457b0bf659f',
    'kungfu/class/henshan/mi.c': '4aa0bd93bcae95e7d8ebec07d70c7c568a5226c5c615242bd2b56a96d821d001',
    'kungfu/class/henshan/mo.c': 'ef943bc3fe31b58936a961694039c2ecc6419620ed281715c8857ce09dd71124',
    'kungfu/class/henshan/xiang.c': '69615a4ebb7ebbbc53b3736af7c4b4853750989a78a894fef02a5965c9cc0399',
    'kungfu/class/songshan/di.c': 'df4c42475583be2370ab0c1cb25091897466a466655b4c132831a301540fbf94',
    'kungfu/class/songshan/fei.c': 'adf0e8053bd39ef9af40e049025983b3cd8e0a478e2f6d7bba7a23f935a13e21',
    'kungfu/class/songshan/songshan.h': '0b6b7d2f1a1028383ac8928c3b0758db349c6b2de90b914a5c9c85de9fffdad9',
    'kungfu/class/songshan/yao.c': '64a0b365e42a6620480eadf5bbf9f53ef338d6618560d2ec6bce75317e3e7c3c',
    'kungfu/class/songshan/yue.c': '862558352a82d1bdd3fd6d7e887d84fde49a0fdfe33521d7745e81d86bce78e0',
    'kungfu/class/songshan/zuo.c': 'c5e06071c47fbc8f752b8fb59b084db2328ec7978d86c35e409619db5b22e683',
    'kungfu/class/tiezhang/fen.c': '63fef5595e8b3ad2e9004cd12f4497453044d99a92732c12557b351ae371df9d',
    'kungfu/class/tiezhang/qiuqianren.c': 'cbcd08e7a71d96939133bf3a93750225b57081c4db7d022d5c7e0b6d5c77108c',
    'kungfu/class/tiezhang/qiuqianzhang.c': 'a92e1d6e4e28cc46e9a2aa112f863e07f7d3824eb249773b64891e946cb9c67a',
    'kungfu/class/tiezhang/tiezhang.h': 'ffc066f3ec480bf5410341aeb5f40891523d8d181968bd2c48096d5b8dcb226e',
    'kungfu/class/shenlong/hong.c': '67a6de6a7a6735c78abf2af2584ab9c5864a2bca84993b7523c3471e88470088',
    'kungfu/class/shenlong/shenlong.h': '2d5df625791f9307fa9c52703ed7327b66396e30215dd0d8fff1623d149e6158',
    'kungfu/class/xingxiu/ding.c': '8ee965c0aa83bd260873d504e53ce1c6007355c10b8c4ed92cbcf6d76705024b',
    'kungfu/class/xingxiu/zhaixing.c': 'c078af00e248edee98c20aea1b2210567e31effaea450a0814d13baafc9d04c5',
    'kungfu/class/xingxiu/xingxiu.h': 'f0d70e04f65c1b7a9495af1529515815f476524c48aa66294459ca3b3e87a552',
    'kungfu/class/xuanming/he.c': '35d6c81376b053c3d70eb49b7fe677a54aa8a280aa61461cd3b41c10a0d8542c',
    'kungfu/class/xuanming/lu.c': 'a9b6808f61ed85651ead98bcab545df10c52038b7bba44db0243afddb9ea83c8',
    'kungfu/class/xuanming/bai.c': '14bb5032aefa91204aba2fd202273d9b4aa2080f6a32780b1f087e881b9e2b1a',
    'kungfu/class/xuanming/xuanming.h': 'c5ebec0ab5254f75df70f7a009302fa0481be467c99e3eae5dd6f81f318b3027',
    'kungfu/class/xueshan/daerba.c': 'c39c68a8e679a38bf5eb88546538d75dfffec1011f2327ce4d2f95c6a3bc4137',
    'kungfu/class/xueshan/huodu.c': '80c663d6512b5a4c995ef3963cb5c511d88f1a579d7ba0999a9da8c7da1473f5',
    'kungfu/class/xueshan/fawang.c': '20b8e03653dca3fa52e6b7e06c4ba63ff374ab381374c8fd86b506af9d17fa67',
    'kungfu/class/xueshan/xueshan.h': '475eb5ee2a5b557211abaa0f5fe9b4ee904984983b170d1f6d13056c29b17eb3',
    'kungfu/class/xuedao/baoxiang.c': '3da6f1cfd49f1fbe277255aedc1139daee2143664fd178e6295cae9d096f375a',
    'kungfu/class/xuedao/shengdi.c': '6c0ddfd8a314b055809562c94d9b185ebeb12fdf55462a29de2e275579541443',
    'kungfu/class/xuedao/laozu.c': 'f95e6154b91f0841c6678dcbb6ad678bab01575ca68c3e4302467486aa08512e',
    'kungfu/class/xuedao/xuedao.h': 'c50298e746257c9d5f94b212a7ee913224cef25a33621b5d7b09104ff3b2bce8',
    'kungfu/class/duan/daobf.c': '144fe2413ca00386b496287242c56ee6092bc9e7ba052afc24eabb4ac2eb25b5',
    'kungfu/class/duan/duanzc.c': 'feb41b8cfb7f870228e7cbb1d19fed0f427054b29ecc3f242afd5e22c6468af1',
    'kungfu/class/duan/duanzm.c': '56fffaa9a02f08fe164b1b7a981401c6be6e58acef8621e86e6631c1ff7f58ef',
    'kungfu/class/duan/gu.c': 'c710f4d492b7f6c5350064e15154eed39c01ca8cd1fd40dc14da218fbb8fd349',
    'kungfu/class/duan/hua.c': '065684111a119365b2431031fa380127852a77494dcf469189949394c8bf4cd5',
    'kungfu/class/duan/yideng.c': '05a38e2cbceaaf88b7e60e8503c652fa1ac3cf166ed1ca4940374741c1a25458',
    'kungfu/class/duan/zhu.c': '50576df6ffa3103da2ef8363ab02a8846b1d99d9403d214110c093f62348bcd4',
    'kungfu/class/duan/duan.h': '0a37030ff3b6d4a5901124cc7560046ee76ff749fe155959aed484f2f374edbd',
    'kungfu/class/tianlongsi/jiumozhi.c': '8d1529b3d54c0784a9fe1c846a7e988ca4853458ce6c640d4396edffe052c1d6',
    'kungfu/class/mingjiao/daijisi.c': '669da0af7e72f8e228b27177b88eb8ad3d65a59b2180e0e42e045b7e1d51f05f',
    'kungfu/class/mingjiao/lengqian.c': '2156047cf892bd123321204ef0643b16ce61a6f46be6e536da9d629997188ef5',
    'kungfu/class/mingjiao/weiyixiao.c': 'e286280a4197ac8151c541ec2153c3207922f4d3202d1212eb1e9ecacedbe112',
    'kungfu/class/mingjiao/xiexun.c': '17ca7a7ec53f3af6032bcf52f8c5d5c444b96495c799a6a6cce4ab61928bd6a3',
    'kungfu/class/mingjiao/yangxiao.c': 'f5f4282751aac550f46d5b78e6ace7fb3086f5382f79f922d00ef8d30df750c2',
    'kungfu/class/mingjiao/yintianzheng.c': '92260ad74df0b47a9bd2f47c019e04217f583fe461ed30f5de426fa6ec69a1ee',
    'kungfu/class/mingjiao/zhangwuji.c': '10bdaca72e9877baf2ab13bd1883a741ca507d0c988f676b519049f339eb5d63',
    'kungfu/class/mingjiao/mingjiao.h': '1a7d45bd2233b0e95798189729084eccf1e10049779f7e4e3274ef41f67b33a8',
    'kungfu/class/honghua/chang1.c': '15c079772789f95a0b029c453374fb1ef37c25b424d7e994503aaf9adbd3edd7',
    'kungfu/class/honghua/chen.c': '6823ee664c53b250cbd9274e847016615bdeeee2ec774067407528b4b2f31f11',
    'kungfu/class/honghua/lu.c': 'eef23f78aaa3a666f509dd105f713945a0313365edf31fa7e0d1c6849bd1b198',
    'kungfu/class/honghua/luo.c': '80285e018c05d75053204f07c4caa983b7ecbbda765504e477c1c4072571f125',
    'kungfu/class/honghua/wen.c': '8c3b60e13e905fbb41a6aa8b0ead4105c6028976683b7febedbb4b6b0958d22a',
    'kungfu/class/honghua/wuchen.c': 'f13d762dc74b128e1189e710752df5cd1c93bb73f2a0b1948d2e867c2d2aac3a',
    'kungfu/class/honghua/zhao.c': 'e76e8cb3fc7da87b5f42ec9dbdd0f48c02edad816844ccc140b02ec3b79eb5cb',
    'kungfu/class/honghua/honghua.h': '7644398f29512f4458b738319841e270fb562503b5a5116b6b9f78dc388011a1',
    'kungfu/class/gaibang/ada.c': 'b9cb3ce5997d50424abfb01370c0e14a01b1608a5bd24d9e3e53992110f6a63f',
    'kungfu/class/gaibang/bai.c': '83fa5c786b2362adb62f94cfa94aee963f08ccbb377f1955191dbb0f6fd3e597',
    'kungfu/class/gaibang/hong.c': 'f3c62eb3632712051345b153633f6787820ace9935523698723818be1fe9a080',
    'kungfu/class/gaibang/li.c': '87950e59b846ffb35c565aba0cd5f4d56765e81b79ca9ea87b212a441925ebc4',
    'kungfu/class/gaibang/ma.c': 'b956082d9dc0f3872a2afbf108a56df4470998660e5e3b7ca61b8b80cd726484',
    'kungfu/class/gaibang/peng.c': 'c67e7f7c37a04225ba2a0f022f05c69577310fb91672519e666feda9f3a6d207',
    'kungfu/class/gaibang/wu.c': '64151d032e9514947182a7bb57d78ce6fcf83633c4762b6e8276ead9d360fd68',
    'kungfu/class/gaibang/xi.c': 'f377179a8489267daca9be1d5dbab5acc8350ab06757c061689addc0cba11c6e',
    'kungfu/class/gaibang/gaibang.h': 'cc32abb92dc1fbd9fc618f8beef26bc1cf498e25d1575375b95e3ac1cef59733',
    'kungfu/class/gaibang/fight.h': '176bcc9667849c717039f443a3abe957a41e9ad67f18ddcf0959a47ca39f32c4',
    'kungfu/class/taohua/feng.c': '28b35ea4e364dcfee53051d3d645f4a013bd5d45a9cdb8865a9cb05ef68071aa',
    'kungfu/class/taohua/huang.c': 'f5f2ad95ea9bf005b288d81ae9a67457d780b350dbf45865d66c08ec81b9af1e',
    'kungfu/class/taohua/lu.c': 'b7d43aef2abe9931f09ae481d242a9ea7ae9499a369082cf46de786006775e44',
    'kungfu/class/taohua/mei.c': '271e357c4a2328054a9fa1796c87fb66a9885901126ea860321475b97a5af3b7',
    'kungfu/class/taohua/qu.c': 'b5a2acffea1b1163e42e0e15bc4a933640da4a1c536c2f2f28027e045bd07199',
    'kungfu/class/taohua/taohua.h': 'eae1957b43a65808b78f2804c72e39e25266511d8c9516b0ac41e5c30fa26241',
    'kungfu/class/quanzhen/hao.c': 'cc209454b10a69486e200434c08d3ade3875598917499054e1aac6c3df31ba49',
    'kungfu/class/quanzhen/liu.c': '122898d3f33fb8945986ca6736a5cd54ac1a1b632385de0cf424541fde799fb5',
    'kungfu/class/quanzhen/ma.c': '857d5198391f1623f21eaaf350c36018210f4f6872ddc865a40284a01d52b011',
    'kungfu/class/quanzhen/qiu.c': 'c1971780dc5099ec3fad10b825650207ea50173bff028a4b5bf18d4e4970b2d6',
    'kungfu/class/quanzhen/sun.c': '78366c5903a3b5c483ad1bbb60ae4e0e8f5767f688fe69b18e84ffa551a306a0',
    'kungfu/class/quanzhen/tan.c': 'a55ce9d549165cf69ed495b701ed07867b91ae97ab3c1acfb3185e4d01aab7d4',
    'kungfu/class/quanzhen/wang.c': 'e8a482b8efb59ca14c09f9890a7d24b50231dd5ef9fbdc595322aa0081f7e248',
    'kungfu/class/quanzhen/wangchuyi.c': 'f5128480b545d33b118fd309ebe37326abd0d631aefc427300bf5d359af15389',
    'kungfu/class/quanzhen/yin.c': '6da0290a462e8c0b551ee07937dea4dd576426fdaa920cfbc74f710698274bdc',
    'kungfu/class/quanzhen/zhou.c': '1fe3c17c6af7fdb2def7f97391e8958656fcb1dd89f9c1dc46941188296b7ee2',
    'kungfu/class/quanzhen/quanzhen.h': '6beb87bf8c88f8ac95902974a64a29e38fb66dc282dd6ac611c86227809ab604',
    'kungfu/class/wudu/hetieshou.c': '9e807cef39a4db7a900b1b183daf03555a34dc093a62816af17636ba09a502ec',
    'kungfu/class/wudu/qiyunao.c': 'e471180b6e29e86e8865c87cc667401c1917798c7a3a4aeecdaac1f24fd637e6',
    'kungfu/class/wudu/wudu.h': '41ea2ac9acea2f931dd690dea4a33d5585b728fb7c4f40f680202a5e66c966c5',
    'kungfu/class/kunlun/hetaichong.c': '23d9c435df18fbf94f2e077a43dccae7822f88d554e7d227d1af7af631c298e9',
    'kungfu/class/kunlun/hezudao.c': 'acfeafb94a2c90001cfd220eefcb2d486921dbd67e2888b5578ba39e6ea33b5e',
    'kungfu/class/kunlun/banshuxian.c': '0decbddca666d2275de6acc200d96d98fe9cf3707ab9babebd16b2099063e5b5',
    'kungfu/class/kunlun/kunlun.h': '778fbead2296a9dbf4d667f7f2e919aaaddecad9da85ac3e79561d3e142a21b7',
    'kungfu/class/emei/miejue.c': 'c801cb0f1d825307c56b022dc0929b114e50ff16ab901f164a2c39c813639e35',
    'kungfu/class/emei/emei.h': '3e7e62d23ef5a7ea3331c193b2fc0670d81822b5120db6db09fd54023d825c81',
    'kungfu/class/gumu/li.c': 'b84e1b228ab22876aa9cd5efdda4b23b6139b6aac3691180a8adf86b25d9343c',
    'kungfu/class/gumu/gumu.h': '4958e651daf36ad90b2e08d8c9d9eae84ffd1922a4a635536180f23bc09358c8',
    'kungfu/class/hu/hufei.c': '538be69d07e3c9ab4bbd1d6e105c31c79129782a15fbdeef541ac6255768ed41',
    'kungfu/class/hu/huyizhi.c': 'a2a21c4bd8844a548787973d6ec0763569a4cf80f9138e0c5e1470e273c241a5',
    'kungfu/class/hu/hu.h': 'a687356769eae0f65a64e0138d0f9c69596cb7a80571b92b16b264d4cfb263c5',
    'kungfu/class/jueqing/chi.c': '24a764c6bb9f093975dad20505024470e39877c05340770a3831b8455f0f6a31',
    'kungfu/class/riyue/zhao.c': '0531e31e7c0a95dfcfbb7be4eb61fdfdfd6d7a468afe574d0c54de4e55939987',
    'kungfu/class/riyue/fan.c': 'a3020f764ab67c66fa5858a6665748dabe75bf5a234e3004165eb1274414dc05',
    'kungfu/class/riyue/feng.c': '9373429b896a6a6376845636d1026b72546f32d1e0e1c0edd03328caae946be9',
    'kungfu/class/riyue/jia.c': 'a129affaefa0a165833a0d13bf6113cc139a997b1fe672cb9449f19f98f9fda3',
    'kungfu/class/riyue/qin.c': 'f588d36b8ed674f168beab54f8b9f6eb6fafc885cf7b0e3d9718eea42609ad15',
    'kungfu/class/riyue/xiang.c': 'baa3edff7dc8dcea66d99c49cf5a2f02346adc286639a9d98da7c13abee5ddad',
    'kungfu/class/riyue/ren.c': '7185eee115a1b22a7a52370d55838e082d881c5c9ed0cdc504e6a0755e27d0b8',
    'kungfu/class/riyue/sang.c': '0f7c30c0e85abbe03f8142ceabe53597a88057358ba7bb5ea3bc4d858840f853',
    'kungfu/class/riyue/shangguan.c': 'c143f0c62a94555a6638da3dd4202f227ba466dea4fb843fb1207b745b44f9a6',
    'kungfu/class/riyue/riyue.h': '644df161e06b6a6b3678a7edf3486a198e0e1cf0f73a10c5e2f6ecf45ed70812',
    'kungfu/class/huashan/yue-buqun.c': '71361bdbd9125109b078c290c375942ce2f074dad9af38f9a64a5bd77d93fe16',
    'kungfu/class/wudang/zhang.c': '338a8da6f0ae98d725fb662492b9853c9d9e842964cb6fdc21798b8fd771cf4d',
    'kungfu/class/shaolin/du-e.c': '41244bd60a068b0383a21fa0cfe06b8990d547607aa940696be0dd03d9a024c4',
    'kungfu/class/shaolin/du-jie.c': 'ce16e5857dbe147533196ea19b1da67003bf9552e9fbbb10fb4681ad14feb371',
    'kungfu/class/shaolin/du-nan.c': '4f4e94d9b53dddabc4e382dbfd7d2dd2fdb7e4a1f152c12a5ce4b5c63a2c5fdd',
    'kungfu/class/shaolin/du.h': '4c2c543833426e72b84861cbe34897970391b43df2b7e06f2a3dfea963d5febc',
    'kungfu/class/shaolin/shaolin.h': '0bf07d0da41843127fa0170be5973b2649ff8eb3b3623af76c259e93e483f736',
    'kungfu/class/shaolin/xuan-ci.c': 'ea3d19f1f55a552d80f9140efc92328bbaefa29a5fe835ab101f0b314f0f0896',
    'kungfu/class/shaolin/xuan.h': 'a54917c97095341615717769207efe34b7cc99d1c1369adce7a552843e21cd2a',
    'kungfu/class/shaolin/wuming.c': '3adfdf7e2229aead83f5078406b5446ce5452245687def14674cc6b92fe860c6',
    'kungfu/class/shaolin/da-mo.c': 'eb15065e1437e0b2cd5582f6fd8ed92d4be2ed65e7a8d1638d712e84c674244b',
    'adm/daemons/masterd.c': '32b6b5667152b09a902ce4ed7798c0538810a2f9030c1854b508717ad5f5ae95',
    'feature/skill.c': '99e9deecee6444d364b4643f67f5a1db0b20dca9fb78b000a083deb6caf534a8',
    'feature/attribute.c': '1374357d87d48d6373d6f88cb84f0a3c5e4ebcf3b78a9c57d63148d6944f3924',
    'feature/apprentice.c': 'd45dbb167fa87c5bcea3c43e1c9f1350f21570bbb3d77ab0e67fb7cd5b0f6c75',
    'kungfu/skill/guzhuo-zhang.c': '65d87838ff222f24cf492584a8a483b783262e5889506090f8d8e5601698b9cb',
    'kungfu/skill/strike.c': '25e54cb7eb9aba297c629fa0e14f6fb1aaf5cb07f5a0427cb32248598ccd8096',
    'kungfu/skill/martial-cognize.c': '9238927aa151caabc277e812e5b5635af081893be7969cf803f16cb691ddc857',
    'inherit/skill/skill.c': '891da821f84c26820c1e540822dba751f218441cc03f2b95a1fcfcc3923294cd',
    'cmds/std/ask.c': '568ca1c612f6efda4af6ee54e2712a56ff7ba66aa44c42024978a06b5e5836c2',
};

// Specific to book exchanges; do not append these dependencies to already
// frozen ordinary inquiry conditions.
const bookSources = {
    'cmds/std/give.c': '3cc58f358220756b1225056b0ba8dd3538dc3b607683f83c8167f7b0b93e1cf1',
    'clone/lonely/book/zhenjing1.c': 'd6f1c1d5b447b92b8f97e49b9c83d7be6ff02f6249f6d6eb0d9fc3eab00a1c7b',
    'clone/lonely/book/zhenjing2.c': 'ff66cdbe4eb657d9358b54d6eb0a8a66dd3c10fdbad80303b54fc0815d40dc2b',
    'inherit/char/npc.c': 'a76a597c0b4068032b9be1716cb24b05035e25a379765a3eaba9c193d5e61384',
    'feature/quester.c': '6ceff5d98bf831387f3fbddcdd98648ebf6786511ea5ddbd34d317b01f44dc81',
    'adm/daemons/questd.c': 'cdef72e62fe6f19aeccf7dedf56f89daafc4e0b0bb37bb926cb7e00a5eef6126',
};

function publicSource(path) {
    assert.ok(Object.hasOwn(reviewed, path) || Object.hasOwn(bookSources, path)
        || Object.hasOwn(learningSources, path) || Object.hasOwn(chenLearningSources, path)
        || Object.hasOwn(shangLetterSources, path) || Object.hasOwn(fengSources, path)
        || quanzhenLearningSources.includes(path) || wudangLearningSources.includes(path)
        || shaolinLearningSources.includes(path) || shaolinTeachersSources.includes(path)
        || shaolinRecruitSources.includes(path) || shaolinPromotionSources.includes(path) || shaolinTonsureSources.includes(path)
        || shaolinFormationSources.includes(path) || shaolinChallengeSources.includes(path)
        || emeiTeachersSources.includes(path) || emeiRecruitSources.includes(path) || emeiSpecialSources.includes(path)
        || emeiTonsureSources.includes(path) || gumuTeachersSources.includes(path)
        || gumuSpecialTeachingSources.includes(path) || gumuAcquisitionLearningSources.includes(path)
        || gumuItemAcquisitionSources.includes(path) || gumuRecruitSources.includes(path),
        '未核对的教学依赖：' + path);
    const actual = realpathSync(join(root, path));
    assert.ok(isInside(root, actual), '教学源码越出仓库');
    return readFileSync(actual, 'utf8');
}

// Values are the teacher's actual grant thresholds, not perform thresholds.
// In particular, do not silently correct the two bad grant keys from chi.c.
const lessons = [
    ...[
        { id: 'ouyang-wuji', number: 1, topic: '横行无忌', suffix: 'wuji', level: 100,
            contribution: 500, shen: 0, accepted_shen: [-100000, 100000],
            replies: { family: '哪来的野小子', skill: '杖法还不到家' } },
        { id: 'ouyang-qianshe', number: 2, topic: '千蛇出洞', suffix: 'qianshe', level: 120,
            contribution: 800, shen: -40000,
            replies: { family: '你是哪儿来的', skill: '先好好把灵蛇杖法练好了', shen: '手段不够狠毒' } },
        // Preserve the original positive addition (MA-055), not the intended fee.
        { id: 'ouyang-wanshi', number: 3, topic: '千蛇万噬', suffix: 'wanshi', level: 180,
            contribution: 1000, contribution_cost: -1000, shen: -120000, issue: 'MA-055',
            replies: { family: '不是我们欧阳世家的人', skill: '灵蛇杖法还不到家', shen: '行事还不够狠毒' } },
    ].map(l => ({ ...l, teacher: 'kungfu/class/ouyang/ouyangfeng.c', npc: 'ouyang feng',
        family: '欧阳世家', skill: 'lingshe-zhangfa', force: 0,
        dependencies: ['kungfu/class/ouyang/ouyang.h'], function: 'ask_skill' + l.number,
        grant: `can_perform/lingshe-zhangfa/${l.suffix}`,
        replies: { contribution: '效力还不够', ...l.replies } })),
    ...[
        { id: 'shangming-zhen', file: 'ming', npc: 'shang jianming', number: 1,
            topic: '八卦震', skill: 'wai-bagua', suffix: 'zhen', level: 60,
            force: 100, contribution: 100, shen: -5000 },
        { id: 'shangming-kai', file: 'ming', npc: 'shang jianming', number: 2,
            topic: '混沌初开', skill: 'baisheng-quan', suffix: 'kai', level: 100,
            force: 140, contribution: 300, shen: -20000 },
        { id: 'shangming-huan', file: 'ming', npc: 'shang jianming', number: 3,
            topic: '金莲幻生', skill: 'jinbiao-jue', suffix: 'huan', level: 100,
            force: 140, contribution: 300, shen: -15000 },
        { id: 'shangming-yin', file: 'ming', npc: 'shang jianming', number: 4,
            topic: '神卦天印', skill: 'bazhen-zhang', suffix: 'yin', level: 130,
            force: 180, contribution: 500, shen: -20000 },
        { id: 'shangming-juan', file: 'ming', npc: 'shang jianming', number: 5,
            topic: '寒芒暴卷', skill: 'shangjia-dao', suffix: 'juan', level: 50,
            force: 80, contribution: 80, shen: -1000 },
        { id: 'shangming-mang', file: 'ming', npc: 'shang jianming', number: 6,
            topic: '劈天神芒', skill: 'bagua-dao', suffix: 'mang', level: 140,
            force: 200, contribution: 1000, shen: -50000,
            required_skills: [{ skill: 'wai-bagua', level: 140, response: '外八卦神功还练得不到家' }] },
        { id: 'shangming-sha', file: 'ming', npc: 'shang jianming', number: 7,
            topic: '杀龙无悔', skill: 'bagua-dao', suffix: 'sha', level: 180,
            force: 250, contribution: 1800, shen: -80000 },
        { id: 'shangtai-gua', file: 'tai', npc: 'shang laotai', number: 1,
            topic: '劈卦拳', skill: 'bagua-quan', suffix: 'gua', level: 70,
            force: 100, contribution: 100, shen: -10000 },
        { id: 'shangtai-ding', file: 'tai', npc: 'shang laotai', number: 2,
            topic: '背心钉', skill: 'bagua-zhang', suffix: 'ding', level: 80,
            force: 120, contribution: 150, shen: -20000 },
        { id: 'shangtai-wang', file: 'tai', npc: 'shang laotai', number: 3,
            topic: '犀牛望月', skill: 'tan-tui', suffix: 'wang', level: 120,
            force: 150, contribution: 350, shen: -25000 },
        { id: 'shangtai-can', file: 'tai', npc: 'shang laotai', number: 4,
            topic: '天残剑诀', skill: 'quemen-jian', suffix: 'can', level: 80,
            force: 120, contribution: 60, shen: -5000 },
    ].map(l => ({ ...l, teacher: `kungfu/class/shang/${l.file}.c`, family: '商家堡',
        dependencies: ['kungfu/class/shang/shang.h'], function: 'ask_skill' + l.number,
        grant: `can_perform/${l.skill}/${l.suffix}`,
        replies: { family: '与我商家堡素无来往', contribution: '商家堡内碌碌无为',
            skill: '还练得不到家', force: '内功火候尚需提高', shen: '心慈手软' } })),
    ...[
        { id: 'wangjie-gua', file: 'wangjianjie', npc: 'wang jianjie', number: 1,
            topic: '劈卦拳', skill: 'bagua-quan', suffix: 'gua', level: 70, force: 100, contribution: 100 },
        { id: 'wangjie-ding', file: 'wangjianjie', npc: 'wang jianjie', number: 2,
            topic: '背心钉', skill: 'bagua-zhang', suffix: 'ding', level: 80, force: 120, contribution: 150 },
        { id: 'wangjie-pan', file: 'wangjianjie', npc: 'wang jianjie', number: 3,
            topic: '蝰蟒盘身', skill: 'kuimang-dao', suffix: 'pan', level: 40, force: 60, contribution: 50 },
        { id: 'wangying-jia', file: 'wangjianying', npc: 'wang jianying', number: 1,
            topic: '掌中夹镖', skill: 'bagua-zhang', suffix: 'jia', level: 120, force: 150, contribution: 400,
            required_skills: [{ skill: 'bagua-biao', level: 120, response: '八卦镖还练得不到家' }],
            replies: { force: '内功火候是基础' } },
        { id: 'wangying-xian', file: 'wangjianying', npc: 'wang jianying', number: 2,
            topic: '镖中现掌', skill: 'bagua-biao', suffix: 'xian', level: 120, force: 200, contribution: 400,
            required_skills: [{ skill: 'bagua-zhang', level: 120, response: '八卦掌还练得不到家' }],
            replies: { force: '内功火候是基础' } },
        { id: 'wangweiyang-zhen', file: 'wangweiyang', npc: 'wang weiyang', number: 1,
            topic: '八卦震', skill: 'wai-bagua', suffix: 'zhen', level: 60, force: 100, contribution: 100 },
        { id: 'wangweiyang-yin', file: 'wangweiyang', npc: 'wang weiyang', number: 2,
            topic: '神卦天印', skill: 'bazhen-zhang', suffix: 'yin', level: 130, force: 180, contribution: 500 },
        { id: 'wangweiyang-zhi', file: 'wangweiyang', npc: 'wang weiyang', number: 3,
            topic: '乾坤一掷', skill: 'bagua-biao', suffix: 'zhi', level: 120, force: 200, contribution: 800 },
        { id: 'wangweiyang-fan', file: 'wangweiyang', npc: 'wang weiyang', number: 4,
            topic: '翻卦连环掌', skill: 'youshen-zhang', suffix: 'fan', level: 120, force: 160, contribution: 500 },
        { id: 'wangweiyang-mang', file: 'wangweiyang', npc: 'wang weiyang', number: 5,
            topic: '劈天神芒', skill: 'bagua-dao', suffix: 'mang', level: 140, force: 200, contribution: 1000,
            required_skills: [{ skill: 'wai-bagua', level: 140, response: '外八卦神功还练得不到家' }] },
        { id: 'wangweiyang-tian', file: 'wangweiyang', npc: 'wang weiyang', number: 6,
            topic: '天刀八势', skill: 'bagua-dao', suffix: 'tian', level: 200, force: 0,
            max_neili: 3200, contribution: 2400,
            required_skills: [
                { skill: 'wai-bagua', level: 200, response: '外八卦神功还练得不到家' },
                { skill: 'nei-bagua', level: 200, response: '内八卦神功还练得不到家' },
            ] },
        { id: 'wangweiyang-sha', file: 'wangweiyang', npc: 'wang weiyang', number: 7,
            topic: '杀龙无悔', skill: 'bagua-dao', suffix: 'sha', level: 180, force: 250, contribution: 1800,
            replies: { family: '与本镖局素无来往' } },
    ].map(l => ({ ...l, teacher: `kungfu/class/zhenyuan/${l.file}.c`, family: '八卦门',
        shen: 0, accepted_shen: [-100000, 100000], dependencies: ['kungfu/class/zhenyuan/zhenyuan.h'],
        function: 'ask_skill' + l.number, grant: `can_perform/${l.skill}/${l.suffix}`,
        replies: { family: '和本镖局素无来往', skill: '还练得不到家', force: '内功火候尚需提高',
            contribution: l.file === 'wangweiyang' ? '镖局内碌碌无为' : '为镖局出力不够', ...l.replies } })),
    ...[
        { id: 'miao-dan', number: 1, topic: '丹阳劲', skill: 'miaojia-zhang', suffix: 'dan',
            level: 40, force: 50, max_neili: 200, contribution: 50, shen: 2000 },
        { id: 'miao-kai', number: 2, topic: '五岳为开', skill: 'pobei-tui', suffix: 'kai',
            level: 100, force: 150, max_neili: 1000, contribution: 200, shen: 8000 },
        { id: 'miao-zhan', number: 3, topic: '翅展九州', skill: 'chongtian-zhang', suffix: 'zhan',
            level: 120, force: 150, max_neili: 1500, contribution: 350, shen: 12000 },
        { id: 'miao-can', number: 4, topic: '残阳劲', skill: 'suqin-beijian', suffix: 'can',
            level: 60, force: 80, max_neili: 1000, contribution: 50, shen: 3000 },
        { id: 'miao-dian', number: 5, topic: '魁星点元', skill: 'baxian-jian', suffix: 'dian',
            level: 100, force: 150, max_neili: 1000, contribution: 300, shen: 10000 },
        { id: 'miao-zhui', number: 6, topic: '毒龙双锥', skill: 'tianlong-jian', suffix: 'zhui',
            level: 120, force: 150, max_neili: 1500, contribution: 800, shen: 15000 },
        { id: 'miao-zhai', number: 7, topic: '云边摘月', skill: 'miaojia-jian', suffix: 'zhai',
            level: 100, force: 120, max_neili: 800, contribution: 400, shen: 13000 },
        { id: 'miao-zhu', number: 8, topic: '黄龙吐珠', skill: 'miaojia-jian', suffix: 'zhu',
            level: 120, force: 150, max_neili: 1200, contribution: 600, shen: 15000 },
        { id: 'miao-qian', number: 9, topic: '剑舞千秋', skill: 'miaojia-jian', suffix: 'qian',
            level: 160, force: 220, max_neili: 1800, contribution: 1000, shen: 18000 },
        { id: 'miao-gan', number: 10, topic: '流星赶月', skill: 'miaojia-jian', suffix: 'gan',
            level: 200, force: 280, max_neili: 3000, contribution: 2200, shen: 35000 },
    ].map(l => ({ ...l, teacher: 'kungfu/class/miao/miao.c', npc: 'miao renfeng',
        family: '中原苗家', dependencies: ['kungfu/class/miao/miao.h'], function: 'ask_skill' + l.number,
        grant: `can_perform/${l.skill}/${l.suffix}`,
        replies: { family: '给我走开', contribution: '苗家无所作为', skill: '火候未到',
            shen: '侠义正事做得不够', force: '内功火候不足', max_neili: '内力修为不足' } })),
    // Both feng and fengyu exist in the original skill; do not merge their
    // grants or treat different teachers' prices as a defect.
    { id: 'longcheng-fengyu', teacher: 'kungfu/class/murong/longcheng.c', npc: 'murong longcheng',
        family: '慕容世家', function: 'ask_me', topic: '风雨交加', skill: 'longcheng-shendao',
        grant: 'can_perform/longcheng-shendao/fengyu', level: 120, force: 0,
        contribution: 0, contribution_unchecked: true, shen: 0, accepted_shen: [-100000, 100000],
        replies: { family: '我可不认识你', skill: '首先可得练好我的龙城神刀' } },
    ...[
        { id: 'murongfu-zhai', file: 'murongfu', npc: 'murong fu', topic: '摘星式',
            skill: 'qixing-quan', suffix: 'zhai', level: 40, contribution: 140, shen: -4000 },
        { id: 'murongfu-xing', file: 'murongfu', npc: 'murong fu', topic: '剑转七星',
            skill: 'murong-jian', suffix: 'xing', level: 40, contribution: 200, shen: -6000 },
        { id: 'murongfu-feng', file: 'murongfu', npc: 'murong fu', topic: '风雨交加',
            skill: 'longcheng-shendao', suffix: 'feng', level: 80, force: 90, contribution: 320, shen: -9000 },
        { id: 'murongbo-yi', file: 'murongbo', npc: 'murong bo', topic: '斗转星移',
            skill: 'douzhuan-xingyi', suffix: 'yi', level: 160, force: 160,
            secondary_skills: [{ skill: 'zihui-xinfa', level: 180 }], contribution: 900, shen: -60000 },
        { id: 'murongbo-zhi', file: 'murongbo', npc: 'murong bo', topic: '七星指穴',
            skill: 'canhe-zhi', suffix: 'zhi', level: 140, force: 140, dodge: 140,
            contribution: 600, shen: -75000 },
        { id: 'murongbo-you', file: 'murongbo', npc: 'murong bo', topic: '幽冥剑气',
            skill: 'canhe-zhi', suffix: 'you', level: 140, force: 150, contribution: 800, shen: -80000 },
        { id: 'murongbo-jin', file: 'murongbo', npc: 'murong bo', topic: '金刚剑气',
            skill: 'canhe-zhi', suffix: 'jin', level: 160, force: 160, contribution: 1000, shen: -95000 },
        { id: 'murongbo-canhe', file: 'murongbo', npc: 'murong bo', topic: '参合剑气',
            skill: 'canhe-zhi', suffix: 'canhe', level: 160, force: 180, contribution: 1200, shen: -130000 },
    ].map(l => ({ force: 0, ...l, teacher: `kungfu/class/murong/${l.file}.c`, family: '慕容世家',
        dependencies: ['kungfu/class/murong/murong.h'], grant: `can_perform/${l.skill}/${l.suffix}`,
        replies: { dodge: '轻功火候不足' } })),
    ...[
        { id: 'duanmu-gui', file: 'duanmu', npc: 'duanmu yuan', function: 'ask_me',
            topic: '归去来兮', skill: 'wudoumi-shengong', suffix: 'gui', level: 140,
            force: 200, max_neili: 2000, contribution: 1500, free_family: '赤焰洞',
            replies: { family: '哪里钻来的鬼东西', force: '内功练成这样', max_neili: '内力弱成这样' } },
        { id: 'lifuren-huan', file: 'li', npc: 'li furen', function: 'ask_skill',
            topic: '云霞幻生', skill: 'caiyan-gong', suffix: 'huan', level: 120,
            force: 0, dodge: 180, contribution: 500, free_family: '椰花岛',
            replies: { family: '还不给老娘滚开', dodge: '轻功火候未到' } },
        { id: 'lifuren-jie', file: 'li', npc: 'li furen', function: 'ask_skill2',
            topic: '截筋断脉', skill: 'jieshou-jiushi', suffix: 'jie', level: 100,
            family: '椰花岛', other_family: '灵鹫宫', force: 120, max_neili: 850, contribution: 300,
            replies: { family: '你是哪里来的', contribution: '碌碌无为', force: '内功修行太浅',
                max_neili: '内力修行太浅', skill: '火候未到' } },
        { id: 'sangtugong-huan', file: 'sang', npc: 'sang tugong', function: 'ask_skill',
            topic: '幻遁寒星', skill: 'pidi-shenzhen', suffix: 'huan', level: 140,
            force: 200, contribution: 600, free_family: '碧磷洞',
            replies: { family: '快给我滚开', force: '内功差成这样' } },
        { id: 'zhuobufan-mang', file: 'zhuo', npc: 'zhuo bufan', function: 'ask_me',
            topic: '剑芒', skill: 'zhougong-jian', suffix: 'mang', level: 140,
            force: 200, max_neili: 2200, contribution: 1000, free_family: '一字慧剑门',
            replies: { family: '不知阁下这话是什么意思', force: '内功练成这样', max_neili: '内力弱成这样' } },
        { id: 'zuozimu-qian', file: 'zuo', npc: 'zuo zimu', function: 'ask_me',
            topic: '乾坤无量', skill: 'wuliang-jian', suffix: 'qian', level: 100,
            force: 150, contribution: 300, free_family: '无量剑派',
            replies: { family: '你我素不相识', force: '内功火候不足', skill: '火候未到' } },
    ].map(l => ({ family: '灵鹫宫', shen: 0, accepted_shen: [-100000, 100000], ...l,
        teacher: `kungfu/class/lingjiu/${l.file}.c`, dependencies: ['kungfu/class/lingjiu/etc.h'],
        grant: `can_perform/${l.skill}/${l.suffix}`,
        replies: { contribution: '不得传功给无功劳', skill: '火候还差得远', ...l.replies } })),
    ...[
        { id: 'xuzhu-shan', number: 1, topic: '闪剑诀', skill: 'tianyu-qijian', suffix: 'shan',
            level: 60, force: 100, contribution: 100 },
        { id: 'xuzhu-huanjian', number: 2, topic: '幻剑诀', skill: 'tianyu-qijian', suffix: 'huan',
            level: 120, force: 160, contribution: 300 },
        { id: 'xuzhu-ju', number: 3, topic: '聚剑诀', skill: 'tianyu-qijian', suffix: 'ju',
            level: 130, force: 180, contribution: 400 },
        { id: 'xuzhu-zhe', number: 4, topic: '折梅式', skill: 'zhemei-shou', suffix: 'zhe',
            level: 80, force: 120, contribution: 300 },
        { id: 'xuzhu-hai', number: 5, topic: '海渊式', skill: 'zhemei-shou', suffix: 'hai',
            level: 130, force: 200, contribution: 800 },
        { id: 'xuzhu-zhong', number: 6, topic: '生死符', skill: 'liuyang-zhang', suffix: 'zhong',
            level: 150, force: 200, contribution: 600 },
        { id: 'xuzhu-huanzhang', number: 7, topic: '寰阳式', skill: 'liuyang-zhang', suffix: 'huan',
            level: 130, force: 200, contribution: 1000 },
        { id: 'xuzhu-po', number: 8, topic: '破神诀', skill: 'liuyang-zhang', suffix: 'po',
            level: 220, force: 0, max_neili: 3500, contribution: 2200,
            required_skills: [{ skill: 'bahuang-gong', level: 220, response: '八荒六合唯我独尊功火候不足' }] },
    ].map(l => ({ ...l, teacher: 'kungfu/class/lingjiu/xuzhu.c', npc: 'xuzhu zi',
        family: '灵鹫宫', shen: 0, accepted_shen: [-100000, 100000],
        dependencies: ['kungfu/class/lingjiu/lingjiu.h'], function: 'ask_skill' + l.number,
        grant: `can_perform/${l.skill}/${l.suffix}`,
        replies: { family: '不是我灵鹫宫的人', contribution: '帮着做点事', skill: '多下功夫练练',
            force: '内功火候不足', max_neili: '内力修为不够' } })),
    ...[
        { id: 'suxinghe-zhuo', file: 'suxingh', npc: 'su xinghe', number: 1, topic: '捕风捉影',
            skill: 'qingyun-shou', suffix: 'zhuo', level: 50, force: 100, contribution: 50 },
        { id: 'suxinghe-pan', file: 'suxingh', npc: 'su xinghe', number: 2, topic: '攀阳邀月',
            skill: 'panyang-zhang', suffix: 'pan', level: 60, force: 100, contribution: 100 },
        { id: 'suxinghe-ruyi', file: 'suxingh', npc: 'su xinghe', number: 3, topic: '如意六刀',
            skill: 'ruyi-dao', suffix: 'ruyi', level: 100, force: 150, contribution: 200 },
        { id: 'wuyazi-liu', file: 'wuyazi', npc: 'wuya zi', number: 1, topic: '流月剑诀',
            skill: 'liuyue-jian', suffix: 'liu', level: 120, force: 180, contribution: 400 },
        { id: 'wuyazi-sheng', file: 'wuyazi', npc: 'wuya zi', number: 2, topic: '天升剑诀',
            skill: 'liuyue-jian', suffix: 'sheng', level: 140, force: 200, contribution: 500 },
        { id: 'wuyazi-ling', file: 'wuyazi', npc: 'wuya zi', number: 3, topic: '洛神凌波',
            skill: 'lingbo-weibu', suffix: 'ling', level: 120, force: 180, contribution: 600 },
        { id: 'wuyazi-zhong', file: 'wuyazi', npc: 'wuya zi', number: 4, topic: '生死符',
            skill: 'liuyang-zhang', suffix: 'zhong', level: 150, force: 200, contribution: 600 },
        { id: 'wuyazi-huan', file: 'wuyazi', npc: 'wuya zi', number: 5, topic: '寰阳式',
            skill: 'liuyang-zhang', suffix: 'huan', level: 130, force: 200, contribution: 900 },
        { id: 'wuyazi-zhe', file: 'wuyazi', npc: 'wuya zi', number: 6, topic: '折梅式',
            skill: 'zhemei-shou', suffix: 'zhe', level: 80, force: 120, contribution: 400 },
        { id: 'wuyazi-hai', file: 'wuyazi', npc: 'wuya zi', number: 7, topic: '海渊式',
            skill: 'zhemei-shou', suffix: 'hai', level: 130, force: 200, contribution: 900 },
        // The original beiming requirement and reward are commented out.
        { id: 'wuyazi-hua', file: 'wuyazi', npc: 'wuya zi', number: 8, topic: '化妖功',
            skill: 'zhemei-shou', suffix: 'hua', level: 220, force: 0, max_neili: 3500, contribution: 2500 },
    ].map(l => ({ ...l, teacher: `kungfu/class/xiaoyao/${l.file}.c`, family: '逍遥派',
        shen: 0, accepted_shen: [-100000, 100000], dependencies: ['kungfu/class/xiaoyao/xiaoyao.h'],
        function: 'ask_skill' + l.number, grant: `can_perform/${l.skill}/${l.suffix}`,
        replies: { family: '和本派素无瓜葛', contribution: '甚无作为', skill: '火候未到',
            force: '内功火候不足', max_neili: '内力修为不够' } })),
    ...[
        { id: 'baiwanjian-leng', file: 'baiwanjian', npc: 'bai wanjian', number: 1,
            topic: '冷剑决', skill: 'hanmei-jian', suffix: 'leng', level: 40, force: 50, contribution: 50,
            replies: { family: '从何而来' } },
        { id: 'baiwanjian-jue', file: 'baiwanjian', npc: 'bai wanjian', number: 2,
            topic: '凌霄总诀', skill: 'lingxiao-quan', suffix: 'jue', level: 60, force: 100, contribution: 100,
            replies: { family: '无故打听' } },
        { id: 'baiwanjian-piao', file: 'baiwanjian', npc: 'bai wanjian', number: 3,
            topic: '飞絮飘零', skill: 'piaoxu-zhang', suffix: 'piao', level: 80, force: 100, contribution: 150,
            replies: { family: '无故打听' } },
        { id: 'baiwanjian-chong', file: 'baiwanjian', npc: 'bai wanjian', number: 4,
            topic: '鹤冲九霄', skill: 'yunhe-jian', suffix: 'chong', level: 100, force: 150, contribution: 200,
            replies: { family: '这样打听' } },
        { id: 'baiwanjian-hui', file: 'baiwanjian', npc: 'bai wanjian', number: 5,
            topic: '风回雪舞', skill: 'xueshan-jian', suffix: 'hui', level: 30, force: 100, contribution: 500,
            replies: { skill: '尚未修炼得精深', force: '内功修行太浅' } },
        { id: 'baiwanjian-chu', file: 'baiwanjian', npc: 'bai wanjian', number: 6,
            topic: '雪花六出', skill: 'xueshan-jian', suffix: 'chu', level: 140, force: 200, contribution: 1000,
            replies: { skill: '尚未修炼得精深', force: '内功修行太浅' } },
        { id: 'baizizai-feng', file: 'baizizai', npc: 'bai zizai', number: 1,
            topic: '剑气封喉', skill: 'xueshan-jian', suffix: 'feng', level: 160, force: 250, contribution: 2000,
            replies: { skill: '尚未修炼得精深', force: '内功修行太浅' } },
        { id: 'baizizai-san', file: 'baizizai', npc: 'bai zizai', number: 2,
            topic: '神倒鬼跌三连环', skill: 'lingxiao-quan', suffix: 'san', level: 180, force: 250, contribution: 1500 },
        { id: 'shipopo-chi', file: 'shipopo', npc: 'shi popo', number: 1,
            topic: '赤焰暴长', skill: 'jinwu-daofa', suffix: 'chi', level: 120, force: 150, contribution: 800,
            replies: { contribution: '碌碌无为', force: '内功修行太浅' } },
        { id: 'shiqing-zhuo', file: 'shiqing', npc: 'shi qing', number: 1,
            topic: '浊流剑', skill: 'shangqing-jian', suffix: 'zhuo', level: 140, force: 200,
            contribution: 800, shen: 15000, accepted_shen: [],
            replies: { family: '素无渊源', contribution: '地位还不足', skill: '尚未修炼得精深',
                shen: '侠义正事做得不够', force: '内功修行太浅' } },
    ].map(l => ({ shen: 0, accepted_shen: [-100000, 100000], ...l,
        teacher: `kungfu/class/lingxiao/${l.file}.c`, family: '凌霄城', function: 'ask_skill' + l.number,
        dependencies: ['kungfu/class/lingxiao/lingxiao.h'], grant: `can_perform/${l.skill}/${l.suffix}`,
        replies: { family: '你是哪里来的', contribution: '本派中无所作为', skill: '练成这样',
            force: '内功修行实在太差', ...l.replies } })),
    ...[
        { id: 'dingjian-dian', file: 'ding', npc: 'ding jian', number: 1, topic: '电光四射',
            skill: 'jidian-jian', suffix: 'dian', level: 100, force: 150, contribution: 50 },
        { id: 'danqing-zui', file: 'danqing', npc: 'danqing sheng', number: 1, topic: '醉里乾坤',
            skill: 'pomopima-jian', suffix: 'zui', level: 120, force: 150, contribution: 300 },
        ...[{ suffix: 'feng', topic: '神笔封穴', number: 1 }, { suffix: 'shiyi', topic: '诗意纵横', number: 2 }]
            .map(l => ({ ...l, id: 'tubi-' + l.suffix, file: 'tubi', npc: 'tubi weng', skill: 'shigu-bifa',
                level: 100, force: 150, contribution: 300,
                required_skills: [{ skill: 'calligraphy', level: 100, response: '连字都写不好' }] })),
        { id: 'heibai-she', file: 'heibai', npc: 'heibai zi', number: 1, topic: '射日诀',
            skill: 'fenglei-zifa', suffix: 'she', level: 100, force: 0, contribution: 300 },
        { id: 'heibai-fenglei', file: 'heibai', npc: 'heibai zi', number: 2, topic: '风雷四击',
            skill: 'fenglei-panfa', suffix: 'fenglei', level: 150, force: 200, contribution: 1000 },
        { id: 'heibai-bing', file: 'heibai', npc: 'heibai zi', number: 3, topic: '冰坚地狱',
            skill: 'xuantian-zhi', suffix: 'bing', level: 180, force: 0, contribution: 1500,
            required_skills: [{ skill: 'xuantian-wujigong', level: 180, response: '玄天无极功火候不够' }] },
        ...[{ suffix: 'yin', number: 1, topic: '七弦无形音', level: 160, force: 250, contribution: 500, music: 120 },
            { suffix: 'shan', number: 2, topic: '七弦黄龙闪', level: 160, force: 250, contribution: 500, music: 120 },
            { suffix: 'zhu', number: 3, topic: '七弦连环诛', level: 180, force: 300, contribution: 2000, music: 150 }]
            .map(l => ({ ...l, id: 'huangzhong-' + l.suffix, file: 'huang', npc: 'huangzhong gong',
                skill: 'qixian-wuxingjian', replies: { force: '内功火候不足' },
                required_skills: [{ skill: 'tanqin-jifa', level: l.music, response: '琴技还不够娴熟' }] })),
    ].map(l => ({ shen: 0, accepted_shen: [-100000, 100000], ...l,
        teacher: `kungfu/class/meizhuang/${l.file}.c`, family: '梅庄', function: 'ask_skill' + l.number,
        dependencies: ['kungfu/class/meizhuang/meizhuang.h'], grant: `can_perform/${l.skill}/${l.suffix}`,
        replies: { family: '和本教素无瓜葛', contribution: '对本庄所作出的贡献不够',
            skill: '还练得不到家', force: '内功火候尚不精纯', ...l.replies } })),
    ...[
        { id: 'lulianrong-huan', file: 'lu', npc: 'lu lianrong', topic: '幻剑式',
            skill: 'henshan-jian', suffix: 'huan', level: 60, force: 80, contribution: 50, shen: 2000 },
        { id: 'lulianrong-suo', file: 'lu', npc: 'lu lianrong', topic: '烟云锁身',
            skill: 'tianzhu-jian', suffix: 'suo', level: 120, force: 150, dodge: 150, contribution: 300, shen: 20000 },
        { id: 'miweiyi-lan', file: 'mi', npc: 'mi weiyi', topic: '青天揽日月',
            skill: 'henshan-quan', suffix: 'lan', level: 60, force: 80, contribution: 50, shen: 2000 },
        { id: 'xiangdanian-lian', file: 'xiang', npc: 'xiang danian', topic: '峰连碧罗',
            skill: 'biluo-zhang', suffix: 'lian', level: 100, force: 120, contribution: 200, shen: 5000 },
        { id: 'moda-hui', file: 'mo', npc: 'mo da', topic: '紫盖回翔',
            skill: 'zigai-jian', suffix: 'hui', level: 120, force: 150, dodge: 120, contribution: 200, shen: 15000 },
        { id: 'moda-luo', file: 'mo', npc: 'mo da', topic: '落英纷飞',
            skill: 'shilin-jian', suffix: 'luo', level: 120, force: 180, contribution: 500, shen: 50000 },
        { id: 'moda-die', file: 'mo', npc: 'mo da', topic: '流云叠影',
            skill: 'liuyun-zhang', suffix: 'die', level: 100, dodge: 150, contribution: 300, shen: 50000 },
        { id: 'moda-pai', file: 'mo', npc: 'mo da', topic: '排山倒海',
            skill: 'liuyun-zhang', suffix: 'pai', level: 140, force: 180, contribution: 600, shen: 50000 },
        { id: 'liuzhengfeng-luan', file: 'liu', npc: 'liu zhengfeng', topic: '乱剑覆花',
            skill: 'furong-jian', suffix: 'luan', level: 100, force: 140, dodge: 140,
            max_neili: 1600, contribution: 300, shen: 20000 },
        { id: 'liuzhengfeng-luo', file: 'liu', npc: 'liu zhengfeng', topic: '一剑落九雁',
            skill: 'luoyan-jian', suffix: 'luo', level: 150, force: 220, dodge: 220,
            max_neili: 2800, contribution: 1500, shen: 50000 },
    ].map(l => ({ force: 0, ...l, teacher: `kungfu/class/henshan/${l.file}.c`, family: '衡山派',
        dependencies: ['kungfu/class/henshan/henshan.h'], grant: `can_perform/${l.skill}/${l.suffix}`,
        replies: { dodge: '轻功火候不足' } })),
    ...[
        { id: 'dixiu-chui', file: 'di', npc: 'di xiu', topic: '千斤锤',
            skill: 'songshan-quan', suffix: 'chui', level: 30, force: 30, contribution: 60, shen: 2000 },
        { id: 'dixiu-po', file: 'di', npc: 'di xiu', topic: '破山斧',
            skill: 'songshan-zhang', suffix: 'po', level: 30, force: 30, contribution: 60, shen: 2000 },
        { id: 'dixiu-meng', file: 'di', npc: 'di xiu', topic: '如梦如幻',
            skill: 'songshan-jian', suffix: 'meng', level: 40, contribution: 80, shen: 2800 },
        { id: 'feibin-ying', file: 'fei', npc: 'fei bin', topic: '无影掌',
            skill: 'songyang-zhang', suffix: 'ying', level: 80, force: 80, dodge: 80, contribution: 300, shen: 32000 },
        { id: 'feibin-xiao', file: 'fei', npc: 'fei bin', topic: '剑气冲霄',
            skill: 'lingyun-jian', suffix: 'xiao', level: 100, force: 120, contribution: 400, shen: 41000 },
        { id: 'feibin-hao', file: 'fei', npc: 'fei bin', topic: '皓月穿空',
            skill: 'chuanyue-jian', suffix: 'hao', level: 120, force: 120, contribution: 520, shen: 52000 },
        // Two distinct programs/IDs exist; do not silently collapse their evidence.
        ...['yao', 'yue'].flatMap(file => [
            { id: `${file}hou-qian`, file, npc: `${file} hou`, topic: '千掌环',
                skill: 'yinyang-zhang', suffix: 'qian', level: 80, dodge: 80, contribution: 220, shen: 3400 },
            { id: `${file}hou-wan`, file, npc: `${file} hou`, topic: '九曲十八弯',
                skill: 'jiuqu-jian', suffix: 'wan', level: 80, dodge: 80, contribution: 260, shen: 36000 },
        ]),
        { id: 'zuolengchan-hen', file: 'zuo', npc: 'zuo lengchan', topic: '踏雪无痕',
            skill: 'hanbing-zhang', suffix: 'hen', level: 100, force: 160, contribution: 550, shen: -32000 },
        { id: 'zuolengchan-han', file: 'zuo', npc: 'zuo lengchan', topic: '极天寒掌',
            skill: 'hanbing-zhang', suffix: 'han', level: 120, force: 200, contribution: 750, shen: -48000 },
        { id: 'zuolengchan-xian', file: 'zuo', npc: 'zuo lengchan', topic: '神光再现',
            skill: 'poyang-jian', suffix: 'xian', level: 100, dodge: 140, contribution: 650, shen: -54000 },
        { id: 'zuolengchan-long', file: 'zuo', npc: 'zuo lengchan', topic: '天外玉龙',
            skill: 'poyang-jian', suffix: 'long', level: 120, force: 180, contribution: 900, shen: -72000 },
        { id: 'zuolengchan-freezing', file: 'zuo', npc: 'zuo lengchan', topic: '寒冰真气',
            skill: 'hanbing-zhenqi', suffix: 'freezing', level: 80, force: 140, contribution: 1500, shen: -93000 },
    ].map(l => ({ force: 0, ...l, teacher: `kungfu/class/songshan/${l.file}.c`, family: '嵩山派',
        dependencies: ['kungfu/class/songshan/songshan.h'], grant: `can_perform/${l.skill}/${l.suffix}`,
        replies: { dodge: '轻功火候不足' } })),
    ...[
        { id: 'situfen-xue', file: 'fen', npc: 'situ fen', topic: '血浪滔天',
            skill: 'tiexue-dao', suffix: 'xue', level: 100, force: 60, contribution: 60, shen: -15000 },
        { id: 'situfen-zhui', file: 'fen', npc: 'situ fen', topic: '穿心锥',
            skill: 'chuanxin-zhang', suffix: 'zhui', level: 100, force: 150, dodge: 220,
            max_neili: 200, contribution: 200, shen: -18000, equivalent_grant_lines: [183, 208] },
        { id: 'situfen-tui', file: 'fen', npc: 'situ fen', topic: '破甲推山',
            skill: 'tiexian-quan', suffix: 'tui', level: 100, force: 90,
            max_neili: 400, contribution: 260, shen: -23000 },
        { id: 'qiuqianren-lei', file: 'qiuqianren', npc: 'qiu qianren', topic: '掌心雷',
            skill: 'tie-zhang', suffix: 'lei', level: 160, force: 220,
            max_neili: 2200, contribution: 600, shen: -65000 },
        { id: 'qiuqianren-juesha', file: 'qiuqianren', npc: 'qiu qianren', topic: '九穹绝刹掌',
            skill: 'tie-zhang', suffix: 'juesha', level: 200, force: 300,
            max_neili: 2200, contribution: 800, shen: -85000 },
        { id: 'qiuqianren-long', file: 'qiuqianren', npc: 'qiu qianren', topic: '龙影掌',
            skill: 'tie-zhang', suffix: 'long', level: 100, force: 80,
            max_neili: 1300, contribution: 300, shen: -60000 },
        { id: 'qiuqianren-dao', file: 'qiuqianren', npc: 'qiu qianren', topic: '五指刀',
            skill: 'tie-zhang', suffix: 'dao', level: 180, force: 260,
            max_neili: 2500, contribution: 700, shen: -90000 },
        { id: 'qiuqianren-yin', file: 'qiuqianren', npc: 'qiu qianren', topic: '阴阳磨',
            skill: 'tie-zhang', suffix: 'yin', level: 220, force: 300,
            max_neili: 3500, contribution: 900, shen: -95000 },
        { id: 'qiuqianren-zha', file: 'qiuqianren', npc: 'qiu qianren', topic: '春雷炸空',
            skill: 'tianlei-dao', suffix: 'zha', level: 150, force: 140,
            max_neili: 1500, contribution: 600, shen: -75000 },
        { id: 'qiuqianren-shan', file: 'qiuqianren', npc: 'qiu qianren', topic: '五雷连闪',
            skill: 'tianlei-dao', suffix: 'shan', level: 150, force: 150,
            max_neili: 1500, contribution: 600, shen: -75000 },
        { id: 'qiuqianzhang-chu', file: 'qiuqianzhang', npc: 'qiu qianzhang', topic: '孤雁出群',
            skill: 'tongbi-zhang', suffix: 'chu', level: 80, force: 40, contribution: 60, shen: -5000 },
        { id: 'qiuqianzhang-jing', file: 'qiuqianzhang', npc: 'qiu qianzhang', topic: '皓月惊空',
            skill: 'guyue-chan', suffix: 'jing', level: 80, force: 40, contribution: 80, shen: -8000 },
        { id: 'qiuqianzhang-fei', file: 'qiuqianzhang', npc: 'qiu qianzhang', topic: '龙飞势',
            skill: 'feilong-zhang', suffix: 'fei', level: 160, force: 240,
            max_neili: 2500, contribution: 400, shen: -20000 },
    ].map(l => ({ ...l, teacher: `kungfu/class/tiezhang/${l.file}.c`, family: '铁掌帮',
        dependencies: ['kungfu/class/tiezhang/tiezhang.h'], grant: `can_perform/${l.skill}/${l.suffix}`,
        replies: { dodge: '轻功火候不足' } })),
    ...[
        { id: 'hongantong-fei', suffix: 'fei', topic: '飞仙法', level: 100, shen: -40000,
            replies: { skill: '蛇岛奇功学好了么', shen: '手段还不够毒', family: '你是哪儿来的' } },
        { id: 'hongantong-xian', suffix: 'xian', topic: '神龙再现', level: 120, shen: -50000,
            replies: { skill: '蛇岛奇功根基不够', shen: '手段要更狠更毒', family: '你是哪儿来的' } },
        { id: 'hongantong-cui', suffix: 'cui', topic: '摧心断肠', level: 120, shen: -50000,
            replies: { skill: '蛇岛奇功根基不够', shen: '手段要更狠更毒', family: '你是哪儿来的' } },
    ].map(l => ({ ...l, teacher: 'kungfu/class/shenlong/hong.c', npc: 'hong antong',
        family: '神龙教', dependencies: ['kungfu/class/shenlong/shenlong.h'],
        function: `ask_${l.suffix}`, skill: 'shedao-qigong', grant: `can_perform/shedao-qigong/${l.suffix}`,
        force: 0, contribution: 0, contribution_unchecked: true })),
    ...[
        { id: 'dingchunqiu-duo', file: 'ding', npc: 'ding chunqiu', topic: '夺魂势',
            skill: 'chanhun-suo', suffix: 'duo', level: 100, basic_force: 130, force: 80,
            skills: { 'huagong-dafa': 15 }, mappings: { force: 'huagong-dafa' },
            contribution: 80, shen: -10000 },
        { id: 'dingchunqiu-dan', file: 'ding', npc: 'ding chunqiu', topic: '炼心弹',
            skill: 'chousui-zhang', suffix: 'dan', level: 140, max_neili: 1800,
            secondary_skills: [{ skill: 'force', level: 140 }, { skill: 'poison', level: 140 },
                { skill: 'throwing', level: 140 }], contribution: 950, shen: -22000 },
        { id: 'dingchunqiu-tao', file: 'ding', npc: 'ding chunqiu', topic: '碧焰滔天',
            skill: 'chousui-zhang', suffix: 'tao', level: 220, max_neili: 3000,
            secondary_skills: [{ skill: 'poison', level: 250 }, { skill: 'huagong-dafa', level: 220 }],
            contribution: 1200, shen: -38000 },
        { id: 'zhaixing-fugu', file: 'zhaixing', npc: 'zhaixing zi', topic: '如蛆附骨',
            skill: 'tianshan-zhang', suffix: 'fugu', level: 60, force: 80, contribution: 80, shen: -2200 },
        { id: 'zhaixing-xue', file: 'zhaixing', npc: 'zhaixing zi', topic: '冰雪纷飞',
            skill: 'tianshan-zhang', suffix: 'xue', level: 60, force: 80, contribution: 80, shen: -22000 },
        { id: 'zhaixing-hua', file: 'zhaixing', npc: 'zhaixing zi', topic: '满天花雨',
            skill: 'feixing-shu', suffix: 'hua', level: 100, basic_force: 120, contribution: 400, shen: -5500 },
        { id: 'zhaixing-suo', file: 'zhaixing', npc: 'zhaixing zi', topic: '锁魂势',
            skill: 'chanhun-suo', suffix: 'suo', level: 70, basic_force: 120, contribution: 400, shen: -6500 },
        { id: 'zhaixing-zhua', file: 'zhaixing', npc: 'zhaixing zi', topic: '三阴毒爪',
            skill: 'sanyin-wugongzhao', suffix: 'zhua', level: 100, basic_force: 100, contribution: 500, shen: -7000 },
        { id: 'zhaixing-shi', file: 'zhaixing', npc: 'zhaixing zi', topic: '腐尸毒',
            skill: 'chousui-zhang', suffix: 'shi', level: 140, max_neili: 1200,
            secondary_skills: [{ skill: 'force', level: 120 }, { skill: 'poison', level: 150 },
                { skill: 'throwing', level: 120 }], contribution: 500, shen: -10000 },
    ].map(l => ({ force: 0, ...l, teacher: `kungfu/class/xingxiu/${l.file}.c`, family: '星宿派',
        dependencies: ['kungfu/class/xingxiu/xingxiu.h'], grant: `can_perform/${l.skill}/${l.suffix}` })),
    ...[
        { id: 'hebi-fei', file: 'he', npc: 'hebi weng', topic: '掌打飞花',
            skill: 'feihua-zhang', suffix: 'fei', level: 40, contribution: 100, shen: -2000 },
        { id: 'hebi-juan', file: 'he', npc: 'hebi weng', topic: '卷字决',
            skill: 'piaofeng-quan', suffix: 'juan', level: 30, contribution: 80, shen: -500 },
        { id: 'hebi-ci', file: 'he', npc: 'hebi weng', topic: '残月刺',
            skill: 'jingyue-bifa', suffix: 'ci', level: 30, contribution: 200, shen: -2400 },
        { id: 'hebi-dian', file: 'he', npc: 'hebi weng', topic: '内点乾坤',
            skill: 'hexing-bifa', suffix: 'dian', level: 100, contribution: 320, shen: -8000 },
        { id: 'hebi-ying', file: 'he', npc: 'hebi weng', topic: '如影相随',
            skill: 'xuanming-zhang', suffix: 'ying', level: 100, dodge: 180, contribution: 380, shen: -32000 },
        { id: 'luzhang-xue', file: 'lu', npc: 'luzhang ke', topic: '缤纷雪舞',
            skill: 'ningxue-zhang', suffix: 'xue', level: 50, contribution: 220, shen: -20000 },
        { id: 'luzhang-tong', file: 'lu', npc: 'luzhang ke', topic: '通天彻地',
            skill: 'lutou-zhang', suffix: 'tong', level: 100, force: 140, contribution: 380, shen: -23000 },
        { id: 'luzhang-zhe', file: 'lu', npc: 'luzhang ke', topic: '只手遮天',
            skill: 'xuanming-zhang', suffix: 'zhe', level: 150, max_neili: 2000,
            secondary_skills: [{ skill: 'xuanming-shengong', level: 150 }], contribution: 880, shen: -50000 },
        { id: 'baisun-bao', file: 'bai', npc: 'baisun daoren', topic: '蛟龙抱',
            skill: 'dulong-shenzhua', suffix: 'bao', level: 100, dodge: 150, contribution: 420, shen: -38000 },
        { id: 'baisun-ju', file: 'bai', npc: 'baisun daoren', topic: '真龙聚',
            skill: 'dulong-shenzhua', suffix: 'ju', level: 130, force: 180, contribution: 580, shen: -43000 },
        { id: 'baisun-lang', file: 'bai', npc: 'baisun daoren', topic: '惊涛骇浪',
            skill: 'xuanming-zhang', suffix: 'lang', level: 180, max_neili: 3000,
            secondary_skills: [{ skill: 'xuanming-shengong', level: 180 }], contribution: 1200, shen: -68000 },
        { id: 'baisun-xing', file: 'bai', npc: 'baisun daoren', topic: '玄冥双行',
            skill: 'xuanming-zhang', suffix: 'xing', level: 220, max_neili: 4000,
            secondary_skills: [{ skill: 'xuanming-shengong', level: 220 }], contribution: 1500, shen: -108000 },
    ].map(l => ({ force: 0, ...l, teacher: `kungfu/class/xuanming/${l.file}.c`, family: '玄冥谷',
        dependencies: ['kungfu/class/xuanming/xuanming.h'], grant: `can_perform/${l.skill}/${l.suffix}`,
        replies: { dodge: '轻功火候不足' } })),
    ...[
        { id: 'daerba-hong', file: 'daerba', npc: 'da erba', number: 1, topic: '轰雷万钧',
            skill: 'dali-chu', suffix: 'hong', level: 80, force: 120, max_neili: 800,
            contribution: 100, shen: -3000,
            replies: { family: '我又不认识你', skill: '把无上大力杵练熟了' } },
        { id: 'daerba-zhen', file: 'daerba', npc: 'da erba', number: 2, topic: '镇魂舞',
            skill: 'xiangmo-chu', suffix: 'zhen', level: 100, force: 150, max_neili: 1500,
            contribution: 200, shen: -6000,
            replies: { family: '我又不认识你', skill: '把金刚降魔杵练熟了' } },
        { id: 'huodu-tong', file: 'huodu', npc: 'huo du', number: 1, topic: '破元通虚',
            skill: 'poxu-daxuefa', suffix: 'tong', level: 120, force: 160,
            contribution: 400, shen: -10000,
            replies: { family: '给我滚开', shen: '为人如此正派', skill: '把破虚打穴法练熟了' } },
        ...[
            { number: 1, topic: '金刚印', skill: 'dashou-yin', suffix: 'yin', level: 100,
                force: 140, max_neili: 1000, contribution: 200, shen: -15000,
                replies: { skill: '把大手印练熟了' } },
            { number: 2, topic: '修罗降世', skill: 'yujiamu-quan', suffix: 'jiang', level: 100,
                force: 150, max_neili: 1200, contribution: 300, shen: -18000,
                replies: { skill: '把金刚瑜迦母拳练熟了' } },
            { number: 3, topic: '若悲', skill: 'mingwang-jian', suffix: 'ruo', level: 100,
                force: 140, max_neili: 1200, contribution: 100, shen: -10000,
                replies: { skill: '把不动明王剑练熟了' } },
            { number: 4, topic: '降魔', skill: 'mingwang-jian', suffix: 'xiang', level: 140,
                force: 180, max_neili: 1600, contribution: 400, shen: -15000,
                replies: { skill: '把不动明王剑练熟了' } },
            ...[
                { number: 5, topic: '破立势', suffix: 'po' },
                { number: 6, topic: '圆满势', suffix: 'yuan' },
            ].map(l => ({ ...l, skill: 'riyue-lun', level: 120, force: 180, max_neili: 1500,
                contribution: 800, shen: -50000, replies: { skill: '把日月轮法练熟了' },
                required_skills: [{ skill: 'longxiang-gong', level: 30, response: '龙象般若功修为不足' }] })),
            { number: 7, topic: '五轮连转', skill: 'riyue-lun', suffix: 'lian', level: 150,
                force: 250, max_neili: 3000, contribution: 2000, shen: -80000,
                replies: { skill: '把日月轮法练熟了' } },
            ...[
                { number: 8, topic: '龙吞势', suffix: 'tun', level: 180, max_neili: 3000,
                    contribution: 1800, shen: -80000 },
                { number: 9, topic: '象跌势', suffix: 'die', level: 240, max_neili: 4000,
                    contribution: 2200, shen: -120000 },
                { number: 10, topic: '般若极', suffix: 'ji', level: 300, max_neili: 5000,
                    contribution: 2500, shen: -160000 },
            ].map(l => ({ ...l, skill: 'longxiang-gong', force: 0,
                replies: { skill: '龙象般若功修为不足' } })),
        ].map(l => ({ ...l, id: 'fawang-' + l.suffix, file: 'fawang', npc: 'jinlun fawang' })),
    ].map(l => ({ ...l, teacher: `kungfu/class/xueshan/${l.file}.c`, family: '大轮寺',
        function: 'ask_skill' + l.number, dependencies: ['kungfu/class/xueshan/xueshan.h'],
        grant: `can_perform/${l.skill}/${l.suffix}`,
        replies: { family: '素无渊源', contribution: '效力不够', shen: '太过心软',
            force: '内功修为不足', max_neili: '内力修为不足', ...l.replies } })),
    ...[
        { id: 'baoxiang-huo', file: 'baoxiang', npc: 'bao xiang', number: 1, topic: '流星火雨',
            skill: 'honglian-dao', suffix: 'huo', level: 80, force: 120, max_neili: 800,
            contribution: 80, shen: -8000,
            replies: { contribution: '不传无功之人', shen: '心慈手软', skill: '把红莲刀法练熟了' } },
        { id: 'shengdi-kai', file: 'shengdi', npc: 'sheng di', number: 1, topic: '冰河开封',
            skill: 'xueshan-dao', suffix: 'kai', level: 80, force: 100, max_neili: 600,
            contribution: 50, shen: -3000,
            replies: { contribution: '不传无功之人', shen: '心慈手软', skill: '把雪山刀法练熟了' } },
        ...[
            { number: 1, topic: '浴血重生', skill: 'xuedao-dafa', suffix: 'resurrect', level: 120,
                force: 0, max_neili: 1000, contribution: 500, shen: -60000 },
            { number: 2, topic: '金刚印', skill: 'dashou-yin', suffix: 'yin', level: 100,
                force: 140, max_neili: 1000, contribution: 200, shen: -15000,
                replies: { skill: '把大手印练熟了' } },
            { number: 3, topic: '修罗降世', skill: 'yujiamu-quan', suffix: 'jiang', level: 100,
                force: 150, max_neili: 1200, contribution: 300, shen: -18000,
                replies: { skill: '把金刚瑜迦母拳练熟了' } },
            { number: 4, topic: '若悲', skill: 'mingwang-jian', suffix: 'ruo', level: 100,
                force: 140, max_neili: 1200, contribution: 100, shen: -10000,
                replies: { skill: '把不动明王剑练熟了' } },
            { number: 5, topic: '降魔', skill: 'mingwang-jian', suffix: 'xiang', level: 140,
                force: 180, max_neili: 1600, contribution: 400, shen: -15000,
                replies: { skill: '把不动明王剑练熟了' } },
            { number: 6, topic: '无影神刀', skill: 'xuedao-dafa', suffix: 'ying', level: 120,
                force: 160, max_neili: 1500, contribution: 300, shen: -60000 },
            { number: 7, topic: '赤炼神刀', skill: 'xuedao-dafa', suffix: 'chi', level: 160,
                force: 220, max_neili: 2400, contribution: 800, shen: -70000 },
            { number: 8, topic: '祭血神刀', skill: 'xuedao-dafa', suffix: 'xue', level: 160,
                force: 220, max_neili: 2400, contribution: 1000, shen: -80000 },
            { number: 9, topic: '噬血穹苍', skill: 'xuedao-dafa', suffix: 'shi', level: 180,
                force: 250, max_neili: 2600, contribution: 2000, shen: -100000 },
        ].map(l => ({ ...l, id: 'xuedaolaozu-' + l.suffix, file: 'laozu', npc: 'xuedao laozu' })),
    ].map(l => ({ ...l, teacher: `kungfu/class/xuedao/${l.file}.c`, family: '血刀门',
        function: 'ask_skill' + l.number, dependencies: ['kungfu/class/xuedao/xuedao.h'],
        grant: `can_perform/${l.skill}/${l.suffix}`,
        replies: { family: '不是我血刀门', contribution: '帮老夫多做点事', shen: '连杀人都不会了',
            force: '内功修为实在太差', max_neili: '内力差成这样', skill: '把血刀大法练熟了',
            ...(l.file === 'laozu' ? { family: '不象是我血刀门' } : {}), ...l.replies } })),
    ...[
        { id: 'daobaifeng-xi', file: 'daobf', npc: 'dao baifeng', number: 1, topic: '凤栖于梧',
            skill: 'feifeng-bian', suffix: 'xi', level: 120, force: 150, max_neili: 1200,
            contribution: 300, shen_required: true, properties: { gender: '男性' },
            replies: { family: '素无瓜葛', skill: '火候还不够', force: '内功修为太差',
                max_neili: '内力弱成这样', shen: '惹的祸事' } },
        { id: 'guducheng-cuo', file: 'gu', npc: 'gu ducheng', number: 1, topic: '错字诀',
            skill: 'pangen-cuojiefu', suffix: 'cuo', level: 100, force: 120, max_neili: 800,
            contribution: 150, accepted_shen: [-1],
            replies: { family: '素不相识', contribution: '无功劳者不得', skill: '火候还不够',
                force: '内功修为还有待提高', max_neili: '内力修为还有待提高' } },
        { id: 'huahegen-shi', file: 'hua', npc: 'hua hegen', number: 1, topic: '弑元诀',
            skill: 'yuezhao-gong', suffix: 'shi', level: 130, force: 200, max_neili: 1800,
            contribution: 400, accepted_shen: [-1],
            replies: { family: '素无瓜葛', contribution: '不得传功给无功子弟', skill: '火候还不够',
                force: '内功修为太差', max_neili: '内力修为太差' } },
        { id: 'zhudanchen-ding', file: 'zhu', npc: 'zhu danchen', number: 1, topic: '透骨钉',
            skill: 'qingliang-daxuefa', suffix: 'ding', level: 100, force: 150, max_neili: 1200,
            contribution: 400, accepted_shen: [-1],
            replies: { family: '素无瓜葛', contribution: '不得传功给无功子弟', skill: '火候还不够',
                force: '内功修为太差', max_neili: '内力修为太差' } },
        ...[
            { suffix: 'zhi', number: 1, topic: '乾阳神指', skill: 'qiantian-zhi', level: 80,
                force: 100, max_neili: 500, contribution: 50, accepted_shen: [-1] },
            { suffix: 'bian', number: 2, topic: '风云变幻', skill: 'wuluo-zhang', level: 100,
                force: 100, max_neili: 500, contribution: 150, accepted_shen: [-1],
                replies: { skill: '五罗轻烟掌还不够' } },
            { suffix: 'man', number: 3, topic: '金玉满堂', skill: 'jinyu-quan', level: 80,
                force: 100, max_neili: 500, contribution: 150, accepted_shen: [-1],
                replies: { skill: '金玉拳法还不够' } },
            { suffix: 'jing', number: 4, topic: '惊天一剑', skill: 'duanjia-jian', level: 80,
                force: 120, max_neili: 800, contribution: 300, shen_required: true,
                replies: { skill: '段家剑法还不行', force: '内功的修为不够', shen: '去作恶' } },
        ].map(l => ({ ...l, id: 'duanzhengchun-' + l.suffix, file: 'duanzc', npc: 'duan zhengchun' })),
        ...[
            { suffix: 'lian', number: 1, topic: '五绝连环', skill: 'duanjia-jian', level: 120,
                force: 160, contribution: 400, shen_required: true,
                replies: { skill: '段家剑法还不行', force: '内功的修为不够', shen: '去作恶' } },
            { suffix: 'heal', number: 2, topic: '起死回生', skill: 'yiyang-zhi', level: 100,
                force: 150, max_neili: 1500, contribution: 800, meridians: 100, accepted_shen: [-1] },
            { suffix: 'dian', number: 3, topic: '神指点穴', skill: 'yiyang-zhi', level: 120,
                force: 160, max_neili: 1800, contribution: 400, shen: 20000, meridians: 120 },
            { suffix: 'qian', number: 4, topic: '一指乾坤', skill: 'yiyang-zhi', level: 160,
                force: 220, max_neili: 2400, contribution: 1000, shen: 30000, meridians: 160 },
        ].map(l => ({ ...l, id: 'duanzhengming-' + l.suffix, file: 'duanzm', npc: 'duan zhengming' })),
        { id: 'yideng-die', file: 'yideng', npc: 'yideng dashi', number: 1, topic: '阳关三叠',
            skill: 'yiyang-zhi', suffix: 'die', level: 200, force: 300, max_neili: 5000,
            contribution: 2500, shen: 50000, meridians: 200,
            replies: { family: '素不相识', contribution: '所作出的贡献还不够', shen: '侠义正事还做得不够' } },
        { id: 'yideng-jian', file: 'yideng', npc: 'yideng dashi', number: 2, topic: '先天功乾阳剑气',
            skill: 'xiantian-gong', suffix: 'jian', level: 280, force: 500, max_neili: 5000,
            contribution: 3000, shen: 50000, meridians: 200, alternative_families: ['全真教'],
            required_skills: [{ skill: 'yiyang-zhi', level: 280, response: '一阳指诀修为还不够' }],
            replies: { family: '素不相识', contribution: '贡献值不够', shen: '侠义正事还做得不够' } },
    ].map(l => ({ shen: 0, ...l, teacher: `kungfu/class/duan/${l.file}.c`, family: '段氏皇族',
        function: 'ask_skill' + l.number, dependencies: ['kungfu/class/duan/duan.h'],
        grant: `can_perform/${l.skill}/${l.suffix}`,
        required_skills: [...(l.required_skills ?? []), ...(l.meridians
            ? [{ skill: 'jingluo-xue', level: l.meridians, response: '经络学的了解还不透彻' }] : [])],
        replies: { family: '不是我们段家', contribution: '族里碌碌无为', skill: '功力还不够',
            force: '内功的修为还不够', max_neili: '内力修为还不够', shen: '侠义正事做得不够', ...l.replies } })),
    ...[
        { suffix: 'fen', function: 'ask_me', topic: '焚身', level: 180, force: 0,
            contribution: 600, shen: -65000, replies: { skill: '火焰刀法修为还不够' } },
        { suffix: 'yan', function: 'ask_skill', topic: '天寰神炎', level: 220, force: 220,
            max_neili: 5000, contribution: 1200, shen: -120000, replies: { skill: '把火焰刀练熟了' } },
    ].map(l => ({ ...l, id: 'jiumozhi-' + l.suffix, teacher: 'kungfu/class/tianlongsi/jiumozhi.c',
        npc: 'jiumo zhi', family: '密宗', family_unrestricted: true, alternative_families: ['段氏皇族', ''],
        skill: 'huoyan-dao', grant: 'can_perform/huoyan-dao/' + l.suffix,
        replies: { contribution: '贡献还不够', shen: '太过心软', force: '内功修为不足',
            max_neili: '内力修为不足', ...l.replies } })),
    ...[
        { id: 'daijisi-lao', file: 'daijisi', npc: 'dai jisi', topic: '大海捞针',
            skill: 'yinhu-zhang', suffix: 'lao', level: 100, force: 260,
            max_neili: 2000, contribution: 750, shen: 70000 },
        { id: 'daijisi-hua', file: 'daijisi', npc: 'dai jisi', topic: '天外飞花',
            display_name: '绝杀', issue: 'MA-030',
            skill: 'duoming-jinhua', suffix: 'hua', level: 120, force: 200,
            max_neili: 2400, contribution: 750, shen: 70000 },
        { id: 'lengqian-jin', file: 'lengqian', npc: 'leng qian', topic: '紫雷劲',
            skill: 'pili-quan', suffix: 'jin', level: 40, force: 0, contribution: 80, shen: 500 },
        { id: 'weiyixiao-xue', file: 'weiyixiao', npc: 'wei yixiao', topic: '赤血爪',
            skill: 'sougu-yingzhua', suffix: 'xue', level: 60, force: 80, contribution: 200, shen: 11000 },
        { id: 'weiyixiao-jue', file: 'weiyixiao', npc: 'wei yixiao', topic: '连绵不绝',
            skill: 'hanbing-mianzhang', suffix: 'jue', level: 100, force: 0, contribution: 480, shen: 14000 },
        { id: 'xiexun-hun', file: 'xiexun', npc: 'xie xun', topic: '天地混元',
            skill: 'pili-shou', suffix: 'hun', level: 140, force: 240, contribution: 550, shen: 48000 },
        { id: 'xiexun-shang', file: 'xiexun', npc: 'xie xun', topic: '伤字诀',
            skill: 'qishang-quan', suffix: 'shang', level: 120, force: 180, contribution: 550, shen: 48000 },
        { id: 'xiexun-fei', file: 'xiexun', npc: 'xie xun', topic: '魂魄飞扬',
            skill: 'qishang-quan', suffix: 'fei', level: 160, force: 260, contribution: 850, shen: 68000 },
        { id: 'yangxiao-zui', file: 'yangxiao', npc: 'yang xiao', topic: '醉里乾坤',
            skill: 'pomopima-jian', suffix: 'zui', level: 120, force: 180, contribution: 700, shen: 80000 },
        { id: 'yangxiao-fei', file: 'yangxiao', npc: 'yang xiao', topic: '飞剑诀',
            skill: 'xiaoyao-jian', suffix: 'fei', level: 60, force: 0, contribution: 400, shen: 80000 },
        { id: 'yangxiao-kuai', file: 'yangxiao', npc: 'yang xiao', topic: '快剑诀',
            skill: 'xiaoyao-jian', suffix: 'kuai', level: 160, force: 0, dodge: 260,
            contribution: 680, shen: 85000 },
        { id: 'yangxiao-qi', file: 'yangxiao', npc: 'yang xiao', topic: '奇剑诀',
            skill: 'xiaoyao-jian', suffix: 'qi', level: 160, force: 0, max_neili: 3000,
            contribution: 780, shen: 88000 },
        { id: 'yintianzheng-feng', file: 'yintianzheng', npc: 'yin tianzheng', topic: '封杀',
            skill: 'tougu-zhen', suffix: 'feng', level: 100, force: 260,
            max_neili: 2400, contribution: 750, shen: 68000 },
        { id: 'yintianzheng-jue', file: 'yintianzheng', npc: 'yin tianzheng', topic: '绝杀',
            skill: 'yinfeng-dao', suffix: 'jue', level: 140, force: 260,
            max_neili: 2400, contribution: 750, shen: 68000 },
        ...[
            { suffix: 'xi', topic: '吸焰令', level: 140, max_neili: 2000, contribution: 800, shen: 100000 },
            { suffix: 'lian', topic: '敛心令', level: 160, max_neili: 2200, contribution: 800, shen: 100000 },
            { suffix: 'hua', topic: '光华令', level: 160, max_neili: 2400, contribution: 900, shen: 80000 },
            { suffix: 'can', topic: '残血令', level: 220, force: 350, max_neili: 5000,
                contribution: 1000, shen: 100000 },
        ].map(l => ({ force: 0, ...l, id: 'zhangwuji-' + l.suffix, file: 'zhangwuji', npc: 'zhang wuji',
            skill: 'shenghuo-ling' })),
        // free bypasses family only; the original shared teacher still rejects
        // a negative contribution balance even when no positive fee is set.
        ...[
            { suffix: 'hun', topic: '混沌一阳', level: 180, force: 270, max_neili: 2000 },
            { suffix: 'jiu', topic: '九曦混阳', level: 200, force: 320, max_neili: 5000 },
            { suffix: 'po', topic: '金阳破岭', level: 220, max_neili: 5500,
                secondary_skills: [{ skill: 'sword', level: 240 }, { skill: 'force', level: 240 }] },
            { suffix: 'pi', topic: '骄阳劈天', level: 220, max_neili: 5500,
                secondary_skills: [{ skill: 'blade', level: 240 }, { skill: 'force', level: 240 }] },
            { suffix: 'ri', topic: '魔光日无极', level: 260, max_neili: 8000 },
        ].map(l => ({ force: 0, ...l, id: 'zhangwuji-' + l.suffix, file: 'zhangwuji', npc: 'zhang wuji',
            skill: 'jiuyang-shengong', free: 1, alternative_families: [''], contribution: 0, shen: 0 })),
    ].map(l => ({ ...l, teacher: `kungfu/class/mingjiao/${l.file}.c`, family: '明教',
        dependencies: ['kungfu/class/mingjiao/mingjiao.h'], grant: `can_perform/${l.skill}/${l.suffix}` })),
    ...[
        { id: 'chenjialuo-fu', file: 'chen', npc: 'chen jialuo', number: 1, topic: '缚字诀',
            skill: 'jiandun-zhusuo', suffix: 'fu', level: 50, force: 0, max_neili: 600,
            contribution: 200, shen: 60000 },
        { id: 'chenjialuo-qian', file: 'chen', npc: 'chen jialuo', number: 2, topic: '千头万绪',
            skill: 'jiandun-zhusuo', suffix: 'qian', level: 120, force: 180,
            contribution: 1200, shen: 100000, replies: { force: '内力修为不够' } },
        { id: 'chenjialuo-hua', file: 'chen', npc: 'chen jialuo', number: 3, topic: '化蝶',
            skill: 'zhuangzi-wu', suffix: 'hua', level: 150, force: 0, max_neili: 2000,
            contribution: 1000, shen: 100000, dex: 17, skills: { dodge: 150 },
            replies: { dex: '身法灵动性不足' } },
        { id: 'chenjialuo-luan', file: 'chen', npc: 'chen jialuo', number: 4, topic: '百花错乱',
            skill: 'baihua-cuoquan', suffix: 'luan', level: 120, force: 0, max_neili: 2000,
            contribution: 400, shen: 80000 },
        { id: 'chenjialuo-yi', file: 'chen', npc: 'chen jialuo', number: 5, topic: '百花错易',
            skill: 'baihua-cuoquan', suffix: 'yi', level: 150, force: 280, max_neili: 3000,
            contribution: 1000, shen: 100000, replies: { force: '内功修为不够' } },
        { id: 'chenjialuo-hong', file: 'chen', npc: 'chen jialuo', number: 6, topic: '战神轰天诀',
            skill: 'baihua-cuoquan', suffix: 'hong', level: 250, force: 0, max_neili: 5000,
            contribution: 2500, shen: 150000,
            required_skills: [{ skill: 'zhanshen-xinjing', level: 250, response: '战神心经修为不够' }] },
        { id: 'changhezhi-cui', file: 'chang1', npc: 'chang hezhi', number: 1, topic: '催魂掌',
            skill: 'heisha-zhang', suffix: 'cui', level: 100, force: 150,
            contribution: 150, shen: 5000, replies: { family: '老子认不到你',
                contribution: '贡献都做得不够', shen: '行侠仗义都搞忘了',
                force: '内功都没学好', skill: '这副龟儿子德性' } },
        { id: 'lufeiqing-xian', file: 'lu', npc: 'lu feiqing', number: 1, topic: '金针现影',
            skill: 'furong-jinzhen', suffix: 'xian', level: 80, force: 120,
            contribution: 300, shen: 30000 },
        { id: 'lufeiqing-tao', file: 'lu', npc: 'lu feiqing', number: 2, topic: '三环套月',
            skill: 'rouyun-jian', suffix: 'tao', level: 140, force: 180, dodge: 180,
            contribution: 700, shen: 60000, replies: { force: '内功修行太浅', dodge: '轻功修为不够' } },
        { id: 'lufeiqing-xuan', file: 'lu', npc: 'lu feiqing', number: 3, topic: '玄功无极劲',
            skill: 'xuangong-quan', suffix: 'xuan', level: 120, force: 160,
            contribution: 400, shen: 50000, replies: { force: '内功修行太浅' } },
        { id: 'luobing-ying', file: 'luo', npc: 'luo bing', number: 1, topic: '刀影重重',
            skill: 'hanwang-qingdao', suffix: 'ying', level: 80, force: 120,
            contribution: 80, shen: 5000 },
        { id: 'wentailai-lei', file: 'wen', npc: 'wen tailai', number: 1, topic: '雷霆万钧',
            skill: 'benlei-zhang', suffix: 'lei', level: 120, force: 200,
            contribution: 600, shen: 20000 },
        { id: 'wuchen-lian', file: 'wuchen', npc: 'wuchen daozhang', number: 1, topic: '夺命连环',
            skill: 'lianhuan-mizongtui', suffix: 'lian', level: 120, force: 150,
            dodge: 150, max_neili: 1800, contribution: 600, shen: 50000,
            replies: { dodge: '轻功火候不足' } },
        { id: 'wuchen-zhui', file: 'wuchen', npc: 'wuchen daozhang', number: 2, topic: '追魂夺命',
            skill: 'zhuihun-jian', suffix: 'zhui', level: 100, force: 120, max_neili: 800,
            contribution: 300, shen: 35000 },
        { id: 'zhaobanshan-cang', file: 'zhao', npc: 'zhao banshan', number: 1, topic: '掌藏龙',
            skill: 'huilong-bifa', suffix: 'cang', level: 120, force: 160,
            contribution: 600, shen: 30000 },
    ].map(lesson => ({ ...lesson, teacher: `kungfu/class/honghua/${lesson.file}.c`,
        function: `ask_skill${lesson.number}`, family: '红花会',
        dependencies: lesson.file === 'lu' ? [] : ['kungfu/class/honghua/honghua.h'],
        ...(lesson.file === 'lu' ? { other_family: '华山派', alternative_families: ['武当派'] } : {}),
        grant: `can_perform/${lesson.skill}/${lesson.suffix}`,
        replies: { contribution: '贡献还不够', shen: '侠义正事做得不够', skill: '还练得不到家',
            max_neili: '内力修为不够', force: '内功火候不足',
            family: ['luo', 'wen', 'zhao'].includes(lesson.file) ? '和本教素无瓜葛' : '和本会素无瓜葛',
            ...(lesson.file === 'lu' ? { family: '素无渊源', contribution: '所作的贡献不够',
                skill: '尚未修炼得精深' } : {}), ...lesson.replies } })),
    ...[
        { id: 'ada-ao', file: 'ada', npc: 'a da', number: 1, topic: '傲尘剑',
            skill: 'pichen-jian', suffix: 'ao', level: 100, force: 0, shen: 0, contribution: 300 },
        { id: 'ada-fen', file: 'ada', npc: 'a da', number: 2, topic: '焚阳剑',
            skill: 'guanri-jian', suffix: 'fen', level: 150, force: 0, shen: 0, contribution: 1200, max_neili: 2000 },
        { id: 'ada-guan', file: 'ada', npc: 'a da', number: 3, topic: '观日神诀',
            skill: 'guanri-jian', suffix: 'guan', level: 280, force: 0, shen: 0, contribution: 3000, max_neili: 5000 },
        { id: 'baishijing-qin', file: 'bai', npc: 'bai shijing', number: 1, topic: '缠丝擒拿',
            skill: 'chansi-shou', suffix: 'qin', level: 120, force: 150, shen: 30000, contribution: 400 },
        { id: 'lisheng-kai', file: 'li', npc: 'li sheng', number: 1, topic: '五丁开山',
            skill: 'tongchui-zhang', suffix: 'kai', level: 80, force: 90, shen: 1000, contribution: 100 },
        { id: 'lisheng-jue', file: 'li', npc: 'li sheng', number: 2, topic: '绝命一踢',
            skill: 'jueming-tui', suffix: 'jue', level: 80, force: 100, shen: 3000, contribution: 150 },
        { id: 'madayuan-suo', file: 'ma', npc: 'ma dayuan', number: 1, topic: '铁爪锁喉',
            skill: 'suohou-gong', suffix: 'suo', level: 150, force: 0, shen: 20000, contribution: 400 },
        { id: 'pengyoujing-luan', file: 'peng', npc: 'peng youjing', number: 1, topic: '群魔乱舞',
            skill: 'fengmo-zhang', suffix: 'luan', level: 120, force: 150, shen: 0, contribution: 400 },
        { id: 'wuchangfeng-tan', file: 'wu', npc: 'wu changfeng', number: 1, topic: '乌龙探海',
            skill: 'liuhe-zhang', suffix: 'tan', level: 60, force: 100, shen: 3000, contribution: 50 },
        { id: 'wuchangfeng-shan', file: 'wu', npc: 'wu changfeng', number: 2, topic: '闪刀诀',
            skill: 'liuhe-dao', suffix: 'shan', level: 80, force: 100, shen: 5000, contribution: 200 },
        { id: 'xizhanglao-lun', file: 'xi', npc: 'xi zhanglao', number: 1, topic: '风火轮',
            skill: 'fumo-zhang', suffix: 'lun', level: 120, force: 150, shen: 30000, contribution: 350 },
    ].map(lesson => ({ ...lesson, teacher: `kungfu/class/gaibang/${lesson.file}.c`,
        function: `ask_skill${lesson.number}`, family: '丐帮',
        properties: { 'family/beggarlvl': 0 }, ...(lesson.file === 'ada' ? { master: 'hong qigong' } : {}),
        dependencies: lesson.file === 'ada' ? [] : ['kungfu/class/gaibang/gaibang.h',
            ...(['bai', 'li', 'peng', 'wu', 'xi'].includes(lesson.file) ? ['kungfu/class/gaibang/fight.h'] : [])],
        grant: `can_perform/${lesson.skill}/${lesson.suffix}`,
        replies: lesson.file === 'ada' ? { family: '给我滚开', contribution: '帮内毫无作为',
            skill: '还不到家', max_neili: '内力修为不够' }
            : { family: lesson.file === 'ma' ? '问这个干嘛' : '素不相识', contribution: '甚无作为',
                skill: lesson.file === 'ma' ? '还不到家' : lesson.file === 'wu' ? '火候未到' : '火候',
                shen: '侠义正事', force: lesson.file === 'wu' ? '内功火候不足' : '内功修为不足' } })),
    ...[
        { id: 'xian', number: 1, topic: '仙游诀', skill: 'xiaoyaoyou', level: 100, force: 120, shen: 10000, contribution: 300 },
        { id: 'du', number: 2, topic: '金针渡劫', skill: 'pomie-jinzhen', level: 150, force: 200, shen: 10000, contribution: 300 },
        { id: 'chan', number: 3, topic: '缠字诀', skill: 'dagou-bang', level: 60, force: 100, shen: 80000, contribution: 300 },
        { id: 'chuo', number: 4, topic: '戳字诀', skill: 'dagou-bang', level: 100, force: 160, shen: 80000, contribution: 600 },
        { id: 'feng', number: 5, topic: '封字诀', skill: 'dagou-bang', level: 120, force: 180, shen: 80000, contribution: 1500 },
        { id: 'ban', number: 6, topic: '绊字诀', skill: 'dagou-bang', level: 180, force: 240, shen: 100000, contribution: 1800 },
        { id: 'qu', number: 8, topic: '双龙取水', skill: 'xianglong-zhang', level: 150, force: 300, shen: 100000, contribution: 800 },
        { id: 'zhen', number: 9, topic: '震惊百里', skill: 'xianglong-zhang', level: 150, force: 300, shen: 100000, contribution: 2000 },
        { id: 'fei', number: 10, topic: '飞龙在天', skill: 'xianglong-zhang', level: 150, force: 300, shen: 100000, contribution: 3000 },
        { id: 'hui', number: 11, topic: '亢龙有悔', skill: 'xianglong-zhang', level: 220, force: 0, basic_force: 260, shen: 120000, contribution: 3000 },
    ].map(lesson => ({ ...lesson, id: `hongqigong-${lesson.id}`, teacher: 'kungfu/class/gaibang/hong.c',
        npc: 'hong qigong', function: `ask_skill${lesson.number}`, family: '丐帮',
        properties: { 'family/beggarlvl': 0 }, dependencies: ['kungfu/class/gaibang/gaibang.h'],
        grant: `can_perform/${lesson.skill}/${lesson.id}`,
        replies: { family: lesson.number === 1 || lesson.number >= 8 ? '我认识你么' : '什么时候说过要教你',
            contribution: '帮中无所作为', shen: '侠义之事做得不够', skill: '火候未到',
            force: '内功火候不足', basic_force: '基本内功火候不足' } })),
    ...[
        { id: 'fengmofeng-tao', file: 'feng', npc: 'feng mofeng', number: 1,
            topic: '碧浪滔天', skill: 'canglang-zhi', suffix: 'tao', level: 80, force: 120, contribution: 50 },
        { id: 'luchengfeng-dai', file: 'lu', npc: 'lu chengfeng', number: 1,
            topic: '披星戴月', skill: 'pikong-zhang', suffix: 'dai', level: 80, force: 120, contribution: 80 },
        { id: 'luchengfeng-kuang', file: 'lu', npc: 'lu chengfeng', number: 2,
            topic: '狂风绝技', skill: 'xuanfeng-tui', suffix: 'kuang', level: 100, force: 150, contribution: 300,
            required_skills: [{ skill: 'pikong-zhang', level: 100, response: '劈空掌还不够熟练' }] },
        { id: 'qulingfeng-sui', file: 'qu', npc: 'qu lingfeng', number: 1,
            topic: '随波逐流', skill: 'luoying-shenjian', suffix: 'sui', level: 80, force: 120, contribution: 120 },
    ].map(lesson => ({ ...lesson, teacher: `kungfu/class/taohua/${lesson.file}.c`,
        function: `ask_skill${lesson.number}`, family: '桃花岛', shen: 0,
        dependencies: ['kungfu/class/taohua/taohua.h'], grant: `can_perform/${lesson.skill}/${lesson.suffix}`,
        replies: { contribution: '不传功给无功劳的弟子', family: '不是我们桃花岛的人',
            force: '内功修为不够', skill: '还不够熟练' } })),
    ...[
        { id: 'zhuan', number: 1, topic: '奇门五转', skill: 'luoying-shenzhang', level: 120,
            force: 180, contribution: 350, skill_reply: '落英神剑掌练熟',
            required_skills: [{ skill: 'qimen-wuxing', level: 120, response: '对奇门五行的研究不够' }] },
        { id: 'fu', number: 2, topic: '兰花拂穴', skill: 'lanhua-shou', level: 120,
            force: 160, contribution: 300, skill_reply: '兰花拂穴手练熟',
            required_skills: [{ skill: 'jingluo-xue', level: 120, response: '连经络学都没学通' }] },
        { id: 'fei', number: 3, topic: '影落飞花', skill: 'lanhua-shou', level: 140,
            force: 200, contribution: 400, skill_reply: '兰花拂穴手练熟' },
        { id: 'tian', number: 4, topic: '天外清音', skill: 'yuxiao-jian', level: 120,
            force: 0, contribution: 350, skill_reply: '玉箫剑法还不够熟练',
            required_skills: [{ skill: 'bibo-shengong', level: 120, response: '碧波神功的修为不够' }] },
        { id: 'qing', number: 5, topic: '天地情长', skill: 'yuxiao-jian', level: 150,
            force: 200, contribution: 400, skill_reply: '玉箫剑法练熟' },
        { id: 'bihai', number: 6, topic: '碧海潮生', skill: 'yuxiao-jian', level: 180,
            force: 0, contribution: 1000, skill_reply: '玉箫剑法还不够熟练',
            required_skills: [
                { skill: 'bibo-shengong', level: 180, response: '碧波神功的修为不够' },
                { skill: 'bihai-chaosheng', level: 180, response: '碧海潮生曲练好了吗' },
            ] },
        { id: 'ding', number: 7, topic: '定昆仑', skill: 'tanzhi-shentong', level: 120,
            force: 180, contribution: 450,
            required_skills: [{ skill: 'jingluo-xue', level: 120, response: '需先通晓经络学' }] },
        { id: 'xiao', number: 8, topic: '啸沧海', skill: 'tanzhi-shentong', level: 200,
            force: 280, max_neili: 3000, contribution: 800,
            required_skills: [{ skill: 'jingluo-xue', level: 200, response: '需先通晓经络学' }] },
        { id: 'po', number: 9, topic: '破九域', skill: 'tanzhi-shentong', level: 180,
            force: 250, max_neili: 2500, contribution: 1300,
            required_skills: [{ skill: 'throwing', level: 180, response: '暗器运用还不够娴熟' }] },
        { id: 'zhuan-finger', suffix: 'zhuan', number: 10, topic: '转乾坤', skill: 'tanzhi-shentong', level: 220,
            force: 300, max_neili: 3500, contribution: 2200,
            required_skills: [{ skill: 'qimen-wuxing', level: 200, response: '对奇门五行的研究不够' }] },
    ].map(lesson => ({ ...lesson, id: `huangyaoshi-${lesson.id}`, teacher: 'kungfu/class/taohua/huang.c',
        npc: 'huang yaoshi', function: `ask_skill${lesson.number}`, family: '桃花岛', shen: 0,
        dependencies: ['kungfu/class/taohua/taohua.h'],
        grant: `can_perform/${lesson.skill}/${lesson.suffix ?? lesson.id}`,
        replies: { contribution: '桃花岛无所作为', family: '不是我们桃花岛的人',
            force: '内功火候尚需提高', max_neili: '内力修为太差',
            skill: lesson.skill_reply ?? '弹指神通火候还不够' } })),
    ...[
        { id: 'haodatong-po', file: 'hao', npc: 'hao datong', number: 1,
            topic: '破穹云蛟', skill: 'qixing-shou', suffix: 'po', level: 150,
            force: 200, contribution: 800, shen: 30000 },
        { id: 'liuchuxuan-lian', file: 'liu', npc: 'liu chuxuan', number: 1,
            topic: '重阳连环掌', skill: 'chongyang-shenzhang', suffix: 'lian', level: 100,
            force: 120, contribution: 100, shen: 10000 },
        { id: 'mayu-suo', file: 'ma', npc: 'ma yu', number: 1,
            topic: '玄门金锁', skill: 'jinguan-yusuo', suffix: 'suo', level: 150,
            force: 200, contribution: 400, shen: 50000 },
        { id: 'qiuchuji-fen', file: 'qiu', npc: 'qiu chuji', number: 1,
            topic: '玉石俱焚', skill: 'tonggui-jian', suffix: 'fen', level: 120,
            force: 150, max_neili: 1500, contribution: 600, shen: 30000 },
        { id: 'sunbuer-bai', file: 'sun', npc: 'sun buer', number: 1,
            topic: '朝拜天罡', skill: 'tiangang-chenfa', suffix: 'bai', level: 120,
            force: 0, max_neili: 1500, contribution: 150, shen: 10000 },
        { id: 'tanchuduan-ju', file: 'tan', npc: 'tan chuduan', number: 1,
            topic: '三花聚顶', skill: 'haotian-zhang', suffix: 'ju', level: 120,
            force: 180, contribution: 250, shen: 30000 },
        { id: 'wangchongyang-hup', file: 'wang', npc: 'wang chongyang', number: 1,
            topic: '五气朝元', skill: 'xiantian-gong', suffix: 'hup', level: 200,
            force: 0, max_neili: 2000, contribution: 500, shen: 100000 },
        { id: 'wangchongyang-hua', file: 'wang', npc: 'wang chongyang', number: 2,
            topic: '一气化三清', skill: 'quanzhen-jian', suffix: 'hua', level: 200,
            force: 0, max_neili: 4500, contribution: 1600, shen: 100000,
            required_skills: [{ skill: 'xiantian-gong', level: 100, response: '先天功的修为不够' }] },
        { id: 'wangchongyang-hun', file: 'wang', npc: 'wang chongyang', number: 3,
            topic: '天地混元', skill: 'xiantian-gong', suffix: 'hun', level: 200,
            force: 0, max_neili: 4000, contribution: 1800, shen: 120000 },
        { id: 'wangchongyang-fen', file: 'wang', npc: 'wang chongyang', number: 4,
            topic: '五阴焚灭', skill: 'xiantian-gong', suffix: 'fen', level: 240,
            force: 0, max_neili: 4000, contribution: 2000, shen: 130000 },
        { id: 'wangchuyi-chan', file: 'wangchuyi', npc: 'wang chuyi', number: 1,
            topic: '缠字诀', skill: 'quanzhen-jian', suffix: 'chan', level: 80,
            force: 100, contribution: 200, shen: 10000 },
        { id: 'wangchuyi-ding', file: 'wangchuyi', npc: 'wang chuyi', number: 2,
            topic: '定阳针', skill: 'quanzhen-jian', suffix: 'ding', level: 100,
            force: 150, contribution: 400, shen: 12000 },
        { id: 'yinzhiping-zhi', file: 'yin', npc: 'yin zhiping', number: 1,
            topic: '剑指南山', skill: 'zhongnan-zhi', suffix: 'zhi', level: 60,
            force: 80, contribution: 50, shen: 3000 },
        { id: 'yinzhiping-xing', file: 'yin', npc: 'yin zhiping', number: 2,
            topic: '群星璀璨', skill: 'qixing-jian', suffix: 'xing', level: 60,
            force: 80, contribution: 80, shen: 3500 },
        { id: 'yinzhiping-lian', file: 'yin', npc: 'yin zhiping', number: 3,
            topic: '三连环', skill: 'quanzhen-jian', suffix: 'lian', level: 180,
            force: 0, max_neili: 2500, contribution: 1000, contribution_cost: 800, shen: 100000 },
        { id: 'zhoubotong-ruo', file: 'zhou', npc: 'zhou botong', number: 1,
            topic: '空明若玄', skill: 'kongming-quan', suffix: 'ruo', level: 100,
            force: 0, max_neili: 1000, contribution: 200, shen: 50000 },
        { id: 'zhoubotong-kong', file: 'zhou', npc: 'zhou botong', number: 2,
            topic: '空空如也', skill: 'kongming-quan', suffix: 'kong', level: 150,
            force: 0, max_neili: 2000, contribution: 500, shen: 60000 },
    ].map(lesson => ({ ...lesson, teacher: `kungfu/class/quanzhen/${lesson.file}.c`,
        function: `ask_skill${lesson.number}`, family: '全真教',
        dependencies: ['kungfu/class/quanzhen/quanzhen.h'], grant: `can_perform/${lesson.skill}/${lesson.suffix}`,
        replies: lesson.file === 'zhou' ? { contribution: '却不努力做事', skill: '还练得不够好',
            family: '我怎么不认识你', shen: '心地还不够好', max_neili: '内力差成这样' }
            : { contribution: '教内甚无作为', family: '与贫道素不相识', shen: '侠义正事还做得不够',
                skill: lesson.file === 'wang' ? (lesson.number === 2 ? '了解还不够透彻' : '先天功的修为不够')
                    : '不够娴熟', force: '内功修为不够',
                max_neili: lesson.file === 'wang' ? '内力修为仍不足' : '内力修为不够' } })),
    ...[
        { id: 'hetieshou-panying', file: 'hetieshou', npc: 'he tieshou', number: 1,
            topic: '盘鹰诀', skill: 'ruanhong-zhusuo', suffix: 'panying', level: 130,
            force: 0, contribution: 300, shen: -30000 },
        { id: 'hetieshou-bohu', file: 'hetieshou', npc: 'he tieshou', number: 2,
            topic: '搏虎诀', skill: 'ruanhong-zhusuo', suffix: 'bohu', level: 160,
            force: 0, contribution: 1300, shen: -50000 },
        { id: 'hetieshou-suolong', file: 'hetieshou', npc: 'he tieshou', number: 3,
            topic: '锁龙诀', skill: 'ruanhong-zhusuo', suffix: 'suolong', level: 160,
            force: 0, contribution: 1500, shen: -80000 },
        { id: 'hetieshou-duo', file: 'hetieshou', npc: 'he tieshou', number: 4,
            topic: '金钩夺魄', skill: 'jinwu-goufa', suffix: 'duo', level: 160,
            force: 0, contribution: 1300, shen: -80000 },
        { id: 'hetieshou-zhen', file: 'hetieshou', npc: 'he tieshou', number: 5,
            topic: '无影针', skill: 'hansha-sheying', suffix: 'zhen', level: 120,
            force: 0, contribution: 300, shen: -80000 },
        { id: 'qiyunao-tengshe', file: 'qiyunao', npc: 'qi yunao', number: 1,
            topic: '腾蛇诀', skill: 'xiewei-bian', suffix: 'tengshe', level: 100,
            force: 0, contribution: 100, shen: -20000 },
        { id: 'qiyunao-chan', file: 'qiyunao', npc: 'qi yunao', number: 2,
            topic: '毒蟾掌', skill: 'tianchan-zhang', suffix: 'chan', level: 120,
            force: 150, contribution: 200, shen: -35000 },
        { id: 'qiyunao-lian', file: 'qiyunao', npc: 'qi yunao', number: 3,
            topic: '夺命连环', skill: 'wusheng-zhao', suffix: 'lian', level: 120,
            force: 150, contribution: 300, shen: -40000 },
    ].map(lesson => ({ ...lesson, teacher: `kungfu/class/wudu/${lesson.file}.c`,
        function: `ask_skill${lesson.number}`, family: '五毒教',
        dependencies: ['kungfu/class/wudu/wudu.h'], grant: `can_perform/${lesson.skill}/${lesson.suffix}`,
        replies: { contribution: '所作的贡献还不够',
            skill: lesson.file === 'hetieshou' ? '还练得不到家' : '还不到家',
            family: lesson.file === 'hetieshou' ? '和本教素无瓜葛' : '不是我们五毒教的人',
            shen: '心慈手软', force: '内功火候不够' } })),
    ...[
        { id: 'hetaichong-shi', file: 'hetaichong', npc: 'he taichong', number: 1,
            topic: '石破天惊', skill: 'zhentian-quan', suffix: 'shi', level: 80, force: 0, contribution: 100 },
        { id: 'hetaichong-liu', file: 'hetaichong', npc: 'he taichong', number: 2,
            topic: '流星电闪', skill: 'kunlun-qifa', suffix: 'liu', level: 120, force: 200, contribution: 300 },
        { id: 'hetaichong-xun', file: 'hetaichong', npc: 'he taichong', number: 3,
            topic: '迅雷一击', skill: 'xunlei-jian', suffix: 'xun', level: 100, force: 150, contribution: 50 },
        { id: 'hetaichong-fanyin', file: 'hetaichong', npc: 'he taichong', number: 4,
            topic: '域外梵音', skill: 'kunlun-jian', suffix: 'fanyin', level: 130, force: 200, contribution: 1000,
            required_skills: [{ skill: 'tanqin-jifa', level: 120, response: '弹琴技法尚且不够熟练' }] },
        { id: 'hetaichong-sui', file: 'hetaichong', npc: 'he taichong', number: 5,
            topic: '玉碎昆冈', skill: 'zhengliangyi-jian', suffix: 'sui', level: 180, force: 250,
            max_neili: 3000, contribution: 800 },
        { id: 'banshuxian-sun', file: 'banshuxian', npc: 'ban shuxian', number: 1,
            topic: '损筋诀', skill: 'sanyin-shou', suffix: 'sun', level: 140, force: 200, contribution: 400 },
        { id: 'banshuxian-wu', file: 'banshuxian', npc: 'ban shuxian', number: 2,
            topic: '无声无色', skill: 'zhengliangyi-jian', suffix: 'wu', level: 160, force: 220,
            dodge: 220, raw_dodge: 220, skills: { 'chuanyun-bu': 110 }, mappings: { dodge: 'chuanyun-bu' },
            dex: 23, contribution: 1200 },
        { id: 'hezudao-qian', file: 'hezudao', npc: 'he zudao', number: 1,
            topic: '乾坤劲', skill: 'qiankun-jian', suffix: 'qian', level: 100, force: 150, contribution: 300 },
        { id: 'hezudao-riyue', file: 'hezudao', npc: 'he zudao', number: 2,
            topic: '日月乾坤', skill: 'qiankun-jian', suffix: 'riyue', level: 150, force: 220, contribution: 1500 },
        { id: 'hezudao-kong', file: 'hezudao', npc: 'he zudao', number: 4,
            topic: '日入空山', skill: 'kunlun-zhang', suffix: 'kong', level: 120, force: 150, contribution: 600 },
    ].map(lesson => ({ ...lesson, teacher: `kungfu/class/kunlun/${lesson.file}.c`,
        function: `ask_skill${lesson.number}`, family: '昆仑派', shen: 0,
        dependencies: ['kungfu/class/kunlun/kunlun.h'], grant: `can_perform/${lesson.skill}/${lesson.suffix}`,
        replies: { contribution: '作出的贡献不够', skill: '修为还不够', family: '和本派素无瓜葛',
            force: lesson.id === 'hetaichong-liu' ? '内功修为怎么这么差' : '内功火候不足',
            max_neili: '内力修为不足', dodge: '轻功火候不足', dex: '身法实在太差' } })),
    ...[
        { id: 'mie', number: 1, topic: '灭剑', skill: 'huifeng-jian', level: 120,
            force: 180, contribution: 1000, shen: 30000 },
        { id: 'jue', number: 2, topic: '绝剑', skill: 'huifeng-jian', level: 180,
            force: 300, contribution: 1800, shen: 30000 },
        { id: 'xing', number: 3, topic: '星罗棋布', skill: 'sixiang-zhang', level: 70,
            force: 100, contribution: 80, shen: 5000 },
        { id: 'bashi', number: 4, topic: '八式合一', skill: 'jinding-zhang', level: 100,
            force: 120, contribution: 250, shen: 8000 },
        { id: 'jie', number: 5, topic: '截筋断脉', skill: 'jieshou-jiushi', level: 100,
            force: 120, max_neili: 850, contribution: 300, shen: 12000 },
        { id: 'ling', number: 6, topic: '凌空指穴', skill: 'tiangang-zhi', level: 100,
            force: 100, max_neili: 800, contribution: 250, shen: 10000 },
        { id: 'huan', number: 7, topic: '无形幻影', skill: 'yanxing-dao', level: 80,
            force: 120, max_neili: 800, contribution: 300, shen: 15000 },
        { id: 'xian', number: 8, topic: '佛光初现', skill: 'emei-jian', level: 60,
            force: 80, contribution: 50, shen: 3000 },
        { id: 'fumo', number: 9, topic: '伏魔剑诀', skill: 'yitian-jian', level: 120,
            force: 180, contribution: 500, shen: 20000 },
    ].map(lesson => ({ ...lesson, id: `miejue-${lesson.id}`, function: `ask_skill${lesson.number}`,
        teacher: 'kungfu/class/emei/miejue.c', npc: 'miejue shitai', family: '峨嵋派',
        dependencies: ['kungfu/class/emei/emei.h'], grant: `can_perform/${lesson.skill}/${lesson.id}`,
        replies: { contribution: lesson.max_neili ? '本派中碌碌无为' : '本派中无所作为',
            skill: [1, 2, 8, 9].includes(lesson.number) ? '尚未修炼得精深' : '火候未到',
            shen: '行侠仗义的事情还做得不够', family: '你是哪里来的',
            force: '内功修行太浅', max_neili: '内力修行太浅' } })),
    ...[
        { id: 'feng', topic: '风魔舞', skill: 'yunzhou-fufa', level: 50,
            force: 0, contribution: 50, shen: -75000 },
        { id: 'bing', topic: '寒冰针', skill: 'bingpo-shenzhen', level: 110,
            force: 140, contribution: 400, shen: -80000 },
        { id: 'wei', topic: '无所不为', skill: 'sanwu-shou', level: 60,
            force: 0, contribution: 300, shen: -80000 },
        { id: 'lian', topic: '赤心连环决', skill: 'chilian-shenzhang', level: 110,
            force: 140, contribution: 400, shen: -85000 },
        { id: 'huan', topic: '千幻神诀', skill: 'wudu-shenzhang', level: 90,
            force: 0, dodge: 140, contribution: 500, shen: -90000 },
        { id: 'zhi', topic: '无所不至', skill: 'sanwu-shou', level: 90,
            force: 0, dodge: 100, contribution: 400, shen: -95000 },
        { id: 'kong', topic: '无孔不入', skill: 'sanwu-shou', level: 120,
            force: 160, contribution: 600, shen: -110000 },
        { id: 'shi', topic: '万毒噬心', skill: 'wudu-shenzhang', level: 140,
            force: 180, contribution: 800, shen: -120000 },
    ].map(lesson => ({ ...lesson, id: `li-${lesson.id}`, teacher: 'kungfu/class/gumu/li.c',
        npc: 'li mochou', family: '古墓派', dependencies: ['kungfu/class/gumu/gumu.h'],
        grant: `can_perform/${lesson.skill}/${lesson.id}`, replies: { dodge: '轻功火候不足' } })),
    { id: 'huyizhi-heng', teacher: 'kungfu/class/hu/huyizhi.c', npc: 'hu yizhi',
        family: '关外胡家', topic: '横扫千军', skill: 'baisheng-daofa', level: 150,
        force: 200, contribution: 600, shen: 8000, grant: 'can_perform/baisheng-daofa/heng' },
    ...[
        { id: 'hufei-juan', topic: '风卷霹雳上九天', function: 'ask_skill1',
            skill: 'hua-quan', level: 120, force: 180, contribution: 350, shen: 5000,
            grant: 'can_perform/hua-quan/juan' },
        { id: 'hufei-kuai', topic: '奔拳快打', function: 'ask_skill2',
            skill: 'hujia-quan', level: 80, force: 100, contribution: 100, shen: 2000,
            grant: 'can_perform/hujia-quan/kuai' },
        { id: 'hufei-tan', topic: '乌龙探海', function: 'ask_skill3',
            skill: 'liuhe-zhang', level: 60, force: 100, contribution: 50, shen: 1500,
            grant: 'can_perform/liuhe-zhang/tan' },
        { id: 'hufei-jian', topic: '作茧自缚', function: 'ask_skill4',
            skill: 'chuncan-zhang', level: 80, force: 120, contribution: 400, shen: 5000,
            grant: 'can_perform/chuncan-zhang/jian' },
        { id: 'hufei-fei', topic: '飞天神行', function: 'ask_skill5',
            skill: 'sixiang-bufa', level: 150, force: 0, basic_force: 150, basic_dodge: 150,
            dex: 18, max_neili: 1000, contribution: 1000, shen: 12000,
            grant: 'can_perform/sixiang-bufa/fei' },
        { id: 'hufei-shan', topic: '星光闪烁', function: 'ask_skill6',
            skill: 'mantian-xing', level: 100, force: 100, contribution: 200, shen: 3000,
            grant: 'can_perform/mantian-xing/shan' },
        { id: 'hufei-xiong', topic: '雄霸群山', function: 'ask_skill7',
            skill: 'chuangwang-dao', level: 40, force: 60, contribution: 50, shen: 500,
            grant: 'can_perform/chuangwang-dao/xiong' },
        { id: 'hufei-dao-shan', topic: '闪刀诀', function: 'ask_skill8',
            skill: 'liuhe-dao', level: 80, force: 100, contribution: 200, shen: 3500,
            grant: 'can_perform/liuhe-dao/shan' },
        { id: 'hufei-xian', topic: '推天献印势', function: 'ask_skill9',
            skill: 'hujia-daofa', level: 120, force: 160, contribution: 900, shen: 15000,
            grant: 'can_perform/hujia-daofa/xian' },
        { id: 'hufei-zhui', topic: '卸甲锥心势', function: 'ask_skill10',
            skill: 'hujia-daofa', level: 140, force: 200, contribution: 1300, shen: 22000,
            grant: 'can_perform/hujia-daofa/zhui' },
        { id: 'hufei-cang', topic: '八方藏刀势', function: 'ask_skill11',
            skill: 'hujia-daofa', level: 180, force: 250, contribution: 2200, shen: 30000,
            grant: 'can_perform/hujia-daofa/cang' },
    ].map(lesson => ({ ...lesson, teacher: 'kungfu/class/hu/hufei.c', npc: 'hu fei',
        family: '关外胡家', dependencies: ['kungfu/class/hu/hu.h'],
        replies: { contribution: '碌碌无为', skill: '火候未到', shen: '侠义正事做得不够',
            family: '不是俺胡家的', force: '内功火候不足', basic_force: '内功火候不足',
            max_neili: '内力修为不够', basic_dodge: '基本轻功有待提高', dex: '身法太差' } })),
    { id: 'chi-tui', teacher: 'kungfu/class/jueqing/chi.c', npc: 'qiu qianchi',
        family: '绝情谷', topic: '破甲推山', skill: 'tiexian-quan', level: 60,
        force: 80, contribution: 100, shen: -60000,
        grant: 'can_perform/tiexian-quan/jia', issue: 'MA-003',
        usable_grant: 'can_perform/tiexian-quan/tui' },
    { id: 'chi-fei', teacher: 'kungfu/class/jueqing/chi.c', npc: 'qiu qianchi',
        family: '绝情谷', topic: '龙飞势', skill: 'feilong-zhang', level: 150,
        force: 120, contribution: 300, shen: -60000,
        grant: 'can_perform/feilong-zhang/fei' },
    { id: 'chi-zhui', teacher: 'kungfu/class/jueqing/chi.c', npc: 'qiu qianchi',
        family: '绝情谷', topic: '穿心锥', skill: 'chuanxin-zhang', level: 80,
        force: 140, contribution: 220, shen: -70000,
        grant: 'can_perform/chuanxin-zhang/zhui' },
    { id: 'chi-ying', teacher: 'kungfu/class/jueqing/chi.c', npc: 'qiu qianchi',
        family: '绝情谷', topic: '无影掌', skill: 'tie-zhang', level: 100,
        force: 160, contribution: 400, shen: -85000,
        grant: 'can_perform/tie-zhang/ying', issue: 'MA-004' },
    { id: 'chi-lei', teacher: 'kungfu/class/jueqing/chi.c', npc: 'qiu qianchi',
        family: '绝情谷', topic: '掌心雷', skill: 'tie-zhang', level: 120,
        force: 0, contribution: 600, shen: -950000,
        grant: 'can_perform/tie-zhang/lei' },
    { id: 'zhao-zhen', teacher: 'kungfu/class/riyue/zhao.c', npc: 'zhao he',
        family: '日月神教', topic: '撼山震岳', skill: 'hanshan-chuifa', level: 180,
        force: 300, contribution: 1200, shen: -120000,
        grant: 'can_perform/hanshan-chuifa/zhen', master: 'ren woxing', strength: 32 },
    ...[
        { id: 'fan-kai', teacher: 'kungfu/class/riyue/fan.c', npc: 'fan song',
            topic: '开天辟地', skill: 'pangu-qishi', level: 180, force: 300,
            contribution: 1200, shen: -120000, grant: 'can_perform/pangu-qishi/kai' },
        { id: 'feng-qian', teacher: 'kungfu/class/riyue/feng.c', npc: 'zhang chengfeng',
            topic: '乾坤一击', skill: 'jinyuan-gun', level: 120, force: 180,
            contribution: 800, shen: -100000, grant: 'can_perform/jinyuan-gun/qian' },
        { id: 'jia-jing', teacher: 'kungfu/class/riyue/jia.c', npc: 'jia bu',
            topic: '惊虹一笔', skill: 'canghong-bifa', level: 100, force: 150,
            contribution: 400, shen: -30000, grant: 'can_perform/canghong-bifa/jing' },
        { id: 'qin-kou', teacher: 'kungfu/class/riyue/qin.c', npc: 'qin weibang',
            topic: '环环相扣', skill: 'danding-dao', level: 80, force: 100,
            contribution: 80, contribution_cost: 100, shen: -8000,
            grant: 'can_perform/danding-dao/kou', issue: 'MA-020' },
        { id: 'xiang-chan', teacher: 'kungfu/class/riyue/xiang.c', npc: 'xiang wentian',
            topic: '跗骨缠魂', skill: 'panlong-suo', level: 120, force: 180,
            contribution: 500, shen: -120000, grant: 'can_perform/panlong-suo/chan' },
        { id: 'xiang-sha', teacher: 'kungfu/class/riyue/xiang.c', npc: 'xiang wentian',
            topic: '绝命七杀', skill: 'panlong-suo', level: 180, force: 220,
            contribution: 1500, shen: -160000, grant: 'can_perform/panlong-suo/sha', function: 'ask_skill2' },
        { id: 'ren-gui', teacher: 'kungfu/class/riyue/ren.c', npc: 'ren woxing',
            topic: '天地归元', skill: 'yuanshi-jian', level: 140, force: 200,
            contribution: 500, shen: -120000, grant: 'can_perform/yuanshi-jian/gui' },
        { id: 'ren-xuan', teacher: 'kungfu/class/riyue/ren.c', npc: 'ren woxing',
            topic: '天旋地转', skill: 'yuanshi-jian', level: 180, force: 260,
            contribution: 1400, shen: -130000, grant: 'can_perform/yuanshi-jian/xuan', function: 'ask_skill2' },
        { id: 'ren-zhuo', teacher: 'kungfu/class/riyue/ren.c', npc: 'ren woxing',
            topic: '大巧若拙', skill: 'guzhuo-zhang', level: 150, force: 220, max_neili: 1800,
            contribution: 600, shen: -120000, grant: 'can_perform/guzhuo-zhang/zhuo', function: 'ask_skill3' },
        { id: 'ren-yu', teacher: 'kungfu/class/riyue/ren.c', npc: 'ren woxing',
            topic: '大智若愚', skill: 'guzhuo-zhang', level: 180, force: 260, max_neili: 2800,
            contribution: 1200, shen: -150000, grant: 'can_perform/guzhuo-zhang/yu', function: 'ask_skill4' },
        { id: 'sang-po', teacher: 'kungfu/class/riyue/sang.c', npc: 'sang sanniang',
            topic: '破靛神砂', skill: 'lansha-shou', level: 100, force: 150,
            contribution: 200, shen: -20000, grant: 'can_perform/lansha-shou/po' },
        { id: 'sang-luo', teacher: 'kungfu/class/riyue/sang.c', npc: 'sang sanniang',
            topic: '星罗棋布', skill: 'heixue-shenzhen', level: 140, force: 200,
            contribution: 400, shen: -35000, grant: 'can_perform/heixue-shenzhen/luo', function: 'ask_skill2' },
        { id: 'sang-cang', teacher: 'kungfu/class/riyue/sang.c', npc: 'sang sanniang',
            topic: '天蝎藏针', skill: 'jifeng-cixuefa', level: 100, force: 120, dodge: 120,
            contribution: 200, shen: -15000, grant: 'can_perform/jifeng-cixuefa/cang', function: 'ask_skill3' },
        { id: 'shangguan-sha', teacher: 'kungfu/class/riyue/shangguan.c', npc: 'shangguan yun',
            topic: '无痕杀', skill: 'shiying-lianhuan', level: 150, force: 200,
            contribution: 600, shen: -40000, grant: 'can_perform/shiying-lianhuan/sha' },
        { id: 'shangguan-duan', teacher: 'kungfu/class/riyue/shangguan.c', npc: 'shangguan yun',
            topic: '断脉破岳', skill: 'poyue-zhao', level: 80, force: 100,
            contribution: 100, shen: -10000, grant: 'can_perform/poyue-zhao/duan', function: 'ask_skill2' },
        { id: 'shangguan-tong', teacher: 'kungfu/class/riyue/shangguan.c', npc: 'shangguan yun',
            topic: '百鬼恸哭', skill: 'zhenyu-quan', level: 80, force: 120,
            contribution: 150, shen: -12000, grant: 'can_perform/zhenyu-quan/tong', function: 'ask_skill3' },
    ].map(lesson => ({ ...lesson, family: '日月神教', function: lesson.function ?? 'ask_skill1',
        dependencies: ['kungfu/class/riyue/riyue.h'],
        replies: { contribution: '教内甚无作为', skill: '还练得不到家',
            family: '不是我日月神教', force: '内功火候尚需提高',
            max_neili: '内力太差', dodge: '轻功火候尚需提高' } })),
    { id: 'yue-san', teacher: 'kungfu/class/huashan/yue-buqun.c', npc: 'yue buqun',
        family: '华山派', topic: '华岳三神峰', skill: 'fanliangyi-dao', level: 100,
        force: 0, basic_force: 140, max_neili: 2000, contribution: 300, shen: 24000,
        grant: 'can_perform/fanliangyi-dao/san' },
    { id: 'yue-wuji', teacher: 'kungfu/class/huashan/yue-buqun.c', npc: 'yue buqun',
        family: '华山派', topic: '混元无极', skill: 'hunyuan-zhang', level: 120,
        force: 0, basic_force: 120, max_neili: 1400, contribution: 400, shen: 28000,
        grant: 'can_perform/hunyuan-zhang/wuji' },
    { id: 'yue-feng', teacher: 'kungfu/class/huashan/yue-buqun.c', npc: 'yue buqun',
        family: '华山派', topic: '封闭手', skill: 'poyu-quan', level: 60,
        force: 150, contribution: 200, shen: 30000, grant: 'can_perform/poyu-quan/feng' },
    { id: 'yue-lei', teacher: 'kungfu/class/huashan/yue-buqun.c', npc: 'yue buqun',
        family: '华山派', topic: '雷动九天', skill: 'poyu-quan', level: 120,
        force: 0, contribution: 400, shen: 40000, grant: 'can_perform/poyu-quan/lei' },
    { id: 'yue-po', teacher: 'kungfu/class/huashan/yue-buqun.c', npc: 'yue buqun',
        family: '华山派', topic: '破石一击', skill: 'poyu-quan', level: 140,
        force: 0, basic_force: 120, contribution: 600, shen: 60000,
        grant: 'can_perform/poyu-quan/po' },
    // Original inquiry closures, not MASTER_D->teach_pfm. Taiji diagram's
    // ten-step progression is configured below, not treated as a boolean grant.
    ...[
        { id: 'zhang-dian', function: 'ask_skill1', topic: '鹤嘴劲',
            skill: 'taiji-shengong', level: 100, max_neili: 1500, contribution: 800,
            shen: 150000, grant: 'can_perform/taiji-shengong/dian' },
        { id: 'zhang-zhen', function: 'ask_skill2', topic: '震字诀',
            skill: 'taiji-quan', level: 150, max_neili: 1200, contribution: 300,
            shen: 100000, grant: 'can_perform/taiji-quan/zhen' },
        { id: 'zhang-yin', function: 'ask_skill3', topic: '引字诀',
            skill: 'taiji-quan', level: 150, max_neili: 1200, contribution: 200,
            shen: 100000, grant: 'can_perform/taiji-quan/yin' },
        { id: 'zhang-ji', function: 'ask_skill4', topic: '挤字诀',
            skill: 'taiji-quan', level: 150, max_neili: 1200, contribution: 400,
            shen: 120000, grant: 'can_perform/taiji-quan/ji' },
        { id: 'zhang-zhan', function: 'ask_skill5', topic: '粘字诀',
            skill: 'taiji-quan', level: 150, max_neili: 1200, contribution: 500,
            shen: 140000, grant: 'can_perform/taiji-quan/zhan' },
        { id: 'zhang-chan', function: 'ask_skill7', topic: '缠字诀',
            skill: 'taiji-jian', level: 80, contribution: 300,
            shen: 80000, grant: 'can_perform/taiji-jian/chan' },
        { id: 'zhang-sui', function: 'ask_skill8', topic: '随字诀',
            skill: 'taiji-jian', level: 60, contribution: 200,
            shen: 80000, grant: 'can_perform/taiji-jian/sui' },
        { id: 'zhang-jia', function: 'ask_skill9', topic: '驾字诀',
            skill: 'taiji-jian', level: 150, contribution: 600,
            shen: 100000, grant: 'can_perform/taiji-jian/jia' },
        { id: 'zhang-zhuan', function: 'ask_skill10', topic: '剑轮岚转',
            skill: 'taiji-jian', level: 160, contribution: 800,
            shen: 120000, grant: 'can_perform/taiji-jian/zhuan' },
        { id: 'zhang-zhenwu', function: 'ask_skill11', topic: '真武除邪',
            skill: 'taiji-jian', level: 180, contribution: 2000,
            shen: 120000, grant: 'can_perform/taiji-jian/zhenwu' },
    ].map(lesson => ({ ...lesson, teacher: 'kungfu/class/wudang/zhang.c', npc: 'zhang sanfeng',
        family: '武当派', force: 0, replies: { contribution: '效力还不够', shen: '行侠仗义',
            skill: lesson.skill === 'taiji-jian' ? '还不到家' : '修为太浅',
            max_neili: '内力修为太浅', family: '不是我们武当派' } })),
    // One shared declaration, three real teachers: preserve each original NPC
    // identity and create() instead of pretending one successful call covers all.
    ...[
        { id: 'du-e', npc: 'du e' }, { id: 'du-jie', npc: 'du jie' }, { id: 'du-nan', npc: 'du nan' },
    ].flatMap(teacher => [
        { id: `${teacher.id}-he`, topic: '合字诀', level: 120, force: 150,
            max_neili: 1000, contribution: 800, shen: 20000, grant: 'can_perform/riyue-bian/he' },
        { id: `${teacher.id}-shang`, topic: '伤字诀', level: 180, force: 250,
            max_neili: 3000, contribution: 1200, shen: 50000, grant: 'can_perform/riyue-bian/shang' },
    ].map(lesson => ({ ...lesson, teacher: `kungfu/class/shaolin/${teacher.id}.c`, npc: teacher.npc,
        source: 'kungfu/class/shaolin/du.h', dependencies: ['kungfu/class/shaolin/shaolin.h'],
        family: '少林派', skill: 'riyue-bian' }))),
    ...[
        { id: 'xuanci-san', topic: '一指点三脉', skill: 'jingang-zhi', level: 200,
            force: 300, max_neili: 3000, contribution: 3000, shen: 50000,
            grant: 'can_perform/jingang-zhi/san' },
        { id: 'xuanci-fumo', topic: '金刚伏魔诀', skill: 'jingang-zhi', level: 150,
            force: 200, max_neili: 2000, contribution: 1000, shen: 30000,
            grant: 'can_perform/jingang-zhi/fumo' },
        { id: 'xuanci-chixue', topic: '赤血连环爪', skill: 'yintuoluo-zhua', level: 200,
            force: 300, max_neili: 3000, contribution: 1500, shen: 50000,
            grant: 'can_perform/yintuoluo-zhua/chixue' },
    ].map(lesson => ({ ...lesson, teacher: 'kungfu/class/shaolin/xuan-ci.c', npc: 'xuanci dashi',
        family: '少林派', dependencies: ['kungfu/class/shaolin/xuan.h', 'kungfu/class/shaolin/shaolin.h'] })),
    ...[
        { id: 'wuming-ruying', topic: '如影随形', skill: 'ruying-suixingtui', level: 160,
            force: 250, max_neili: 2000, contribution: 800, shen: 30000,
            grant: 'can_perform/ruying-suixingtui/ruying' },
        { id: 'wuming-zhe', topic: '避云遮日', skill: 'jiasha-fumogong', level: 180,
            force: 300, max_neili: 3500, contribution: 1000, shen: 70000,
            grant: 'can_perform/jiasha-fumogong/zhe' },
        { id: 'wuming-zong', function: 'ask_skill1', topic: '万佛朝宗', skill: 'rulai-zhang', level: 220,
            force: 350, contribution: 800, shen: 150000, grant: 'can_perform/rulai-zhang/zong',
            replies: { contribution: '没什么作为', skill: '尚未修炼得精深', shen: '侠义正事做得不够' } },
    ].map(lesson => ({ ...lesson, teacher: 'kungfu/class/shaolin/wuming.c', npc: 'wuming laoseng',
        family: '少林派' })),
    // Da Mo's four private sword inquiries are configured separately below;
    // preserve their distinct/incorrect grant logic (MA-017).
    ...[
        { id: 'damo-jishi', topic: '即世即空', skill: 'weituo-chu', level: 120,
            force: 180, max_neili: 500, contribution: 300, shen: 5000,
            grant: 'can_perform/weituo-chu/jishi' },
        { id: 'damo-kong', topic: '金龙疾空', skill: 'longxing-jian', level: 160,
            force: 250, max_neili: 1500, contribution: 600, shen: 10000,
            grant: 'can_perform/longxing-jian/kong' },
        { id: 'damo-huo', topic: '火麒蚀月', skill: 'ranmu-daofa', level: 180,
            force: 300, max_neili: 3000, contribution: 2500, shen: 50000,
            grant: 'can_perform/ranmu-daofa/huo' },
        { id: 'damo-zhen', topic: '震雷乾坤', skill: 'qujing-gunfa', level: 200,
            force: 300, max_neili: 3000, contribution: 2000, shen: 50000,
            grant: 'can_perform/qujing-gunfa/zhen' },
        { id: 'damo-jingang', topic: '大金刚神通', skill: 'jingang-quan', level: 100,
            force: 100, max_neili: 500, contribution: 200, shen: 10000,
            grant: 'can_perform/jingang-quan/jingang' },
        { id: 'damo-tong', topic: '易筋通脉', skill: 'yijinjing', level: 100,
            force: 150, max_neili: 1000, contribution: 500, shen: 10000,
            grant: 'can_perform/yijinjing/tong' },
    ].map(lesson => ({ ...lesson, teacher: 'kungfu/class/shaolin/da-mo.c', npc: 'da mo',
        family: '少林派', dependencies: ['kungfu/class/shaolin/shaolin.h'] })),
];

export function teachingConditions(relations, catalog, readSource = publicSource) {
    assert.equal(relations.source_fingerprint, catalog.source_fingerprint,
        '教学关系与技能目录不属于同一源码');
    const sources = Object.entries(reviewed).map(([path, hash]) => {
        assert.equal(sha256(readSource(path)), hash, '教学依赖变化，须重新核对：' + path);
        return { path, sha256: hash };
    });
    const result = [];
    for (const lesson of lessons) {
        const teacher = relations.objects.find(o => o.path === lesson.teacher);
        assert.equal(teacher?.sha256, reviewed[lesson.teacher], '教师不在核对的来源表中');
        const grants = teacher.grants.filter(g => g.grant === lesson.grant
            && (!lesson.function || g.function === lesson.function));
        if (lesson.equivalent_grant_lines) {
            // One player topic, two identical original switch branches. Keep
            // both locations, without claiming which branch the VM selected.
            assert.deepEqual(grants.map(g => g.evidence.line), lesson.equivalent_grant_lines);
            for (const g of grants) {
                assert.equal(g.operation, 'teach_pfm');
                assert.deepEqual(g.fields, grants[0].fields);
                assert.deepEqual(g.enclosing_function, grants[0].enclosing_function);
            }
        } else assert.equal(grants.length, 1, '传授记录不唯一：' + lesson.id);
        const grant = grants[0];
        assert.equal(grant.role, 'player_grant_candidate');
        const sourcePath = lesson.source ?? lesson.teacher;
        const enclosing = grant.enclosing_function;
        assert.equal(enclosing.path, sourcePath, '教学函数来源与已核对声明不一致');
        assert.equal(enclosing.sha256, reviewed[sourcePath], '教学函数版本不同');
        assert.equal(grant.function, lesson.function ?? (lesson.id === 'zhao-zhen' ? 'ask_hanshan' : 'accept_ask'));
        assert.ok(Number.isSafeInteger(enclosing.line) && enclosing.line > 0);
        const entry = { id: `${sourcePath}:${enclosing.line}:${grant.function}`,
            path: sourcePath, sha256: reviewed[sourcePath], role: 'teaching',
            function: grant.function, line: enclosing.line };
        const qualificationSources = sources.filter(s => s.path === lesson.teacher || s.path === sourcePath
            || lesson.dependencies?.includes(s.path) || !s.path.startsWith('kungfu/class/'));
        if (grant.fields) {
            const fields = Object.fromEntries(Object.entries(grant.fields).map(([k, v]) => [k, v.value]));
            for (const [key, value] of Object.entries({ name: lesson.display_name ?? lesson.topic, perform: lesson.grant,
                sk1: lesson.skill, lv1: lesson.level, gongxian: lesson.contribution, shen: lesson.shen })) {
                const actual = fields[key] ?? (['gongxian', 'shen'].includes(key) ? 0 : undefined);
                assert.equal(actual, value, '已核对的教学字段改变：' + lesson.id + '/' + key);
            }
            assert.equal(fields.free ?? 0, lesson.free ?? 0);
            assert.equal(fields.force ?? 0, lesson.force);
            assert.equal(fields.dodge ?? 0, lesson.dodge ?? 0);
            const secondary = lesson.secondary_skills ?? (lesson.basic_force
                ? [{ skill: 'force', level: lesson.basic_force }] : []);
            for (let slot = 2; slot <= 5; slot++) {
                assert.equal(fields['sk' + slot] ?? null, secondary[slot - 2]?.skill ?? null);
                assert.equal(fields['lv' + slot] ?? 0, secondary[slot - 2]?.level ?? 0);
            }
            assert.equal(fields.neili ?? 0, lesson.max_neili ?? 0);
        }
        assert.ok(catalog.skills.some(s => s.id === lesson.skill), '真实技能缺失：' + lesson.skill);
        const base = {
            teacher: { path: '/' + lesson.teacher.replace(/\.(?:c|lpc)$/, ''), id: lesson.npc,
                sha256: reviewed[lesson.teacher] },
            topic: lesson.topic, action: `ask ${lesson.npc} about ${lesson.topic}`,
            actor: { skills: { [lesson.skill]: lesson.level, force: lesson.basic_force ?? lesson.force * 2,
                ...(lesson.basic_dodge ? { dodge: lesson.basic_dodge }
                    : lesson.dodge ? { dodge: lesson.raw_dodge ?? lesson.dodge * 2 } : {}),
                ...lesson.skills, ...Object.fromEntries((lesson.required_skills ?? []).map(s => [s.skill, s.level])),
                ...Object.fromEntries((lesson.secondary_skills ?? []).map(s => [s.skill, s.level])) },
                mappings: lesson.mappings ?? {},
                properties: { 'family/family_name': lesson.family,
                    ...(lesson.master ? { 'family/master_id': lesson.master } : {}),
                    ...(lesson.max_neili ? { max_neili: lesson.max_neili, neili: lesson.max_neili } : {}),
                    ...(lesson.dex !== undefined ? { dex: lesson.dex } : {}),
                    str: lesson.strength ?? 30, shen: lesson.shen,
                    gongxian: lesson.contribution, combat_exp: 10000000, ...lesson.properties } },
            teaching_evidence: grant.evidence,
            ...(lesson.equivalent_grant_lines ? { equivalent_teaching_evidence: grants.map(g => g.evidence) } : {}),
            teaching_entry: entry,
            qualification_sources: qualificationSources.map(s => s.path),
            qualification_evidence: qualificationSources,
            target: { skills: { force: 1 }, mappings: {}, properties: {} },
            fighting: false, observe_seconds: 0, not_applicable: '',
            monitored_grants: [lesson.grant, ...(lesson.usable_grant ? [lesson.usable_grant] : [])],
            known_issue: lesson.issue ?? null,
            note: '通过原 ask 与真实 NPC 传授；记录领悟字段、贡献和技能前后状态。命令返回 1 不证明授课成功，写入领悟也不证明能够施展。实验不声称已完成拜师或普通学习。',
        };
        const checkpoint = (paid, acquired, reason = '') => ({
            grant: lesson.grant, value: acquired ? 1 : 0,
            contribution_spent: paid,
            ...(lesson.usable_grant ? { absent_grants: [lesson.usable_grant] } : {}),
            ...(reason ? { response_contains: reason } : {}),
        });
        const replies = lesson.replies ?? {};
        const add = (variant, parameters, expectations) => {
            result.push({ id: `teaching-${lesson.id}-${variant}`, stage: 'school', method: 'teaching',
                entry_id: entry.id, samples: 2, status: 'configured_not_executed',
                parameters: { ...parameters,
                    expected: expectations[0].value ? 'observed' : 'refused',
                    teaching_expectations: expectations } });
        };
        const paid = lesson.contribution_cost ?? lesson.contribution;
        add('grant', structuredClone(base), [checkpoint(paid, true)]);
        // The second ask follows the first real grant, not an injected flag.
        add('repeat', structuredClone(base), [checkpoint(paid, true), checkpoint(0, true)]);
        if (lesson.id === 'wangweiyang-tian') {
            const shang = structuredClone(base);
            shang.actor.properties['family/family_name'] = '商家堡';
            add('shang-without-letter', shang, [checkpoint(0, false, '没有你师傅同意')]);
        }
        for (const [index, family] of (lesson.alternative_families ?? []).entries()) {
            const p = structuredClone(base);
            p.actor.properties['family/family_name'] = family;
            add(`family-accepted-${index + 1}`, p, [checkpoint(paid, true)]);
        }
        // These five original private inquiries only charge Lingjiu members.
        // Test the NPC's own family separately; do not generalize free access.
        if (lesson.free_family) {
            assert.ok(!grant.fields, '免费本门分支只用于已核对私有询问');
            const local = structuredClone(base);
            local.actor.properties['family/family_name'] = lesson.free_family;
            local.actor.properties.gongxian = 0;
            add('local-family-grant', structuredClone(local), [checkpoint(0, true)]);
            add('local-family-repeat', structuredClone(local), [checkpoint(0, true), checkpoint(0, true)]);
            const negative = structuredClone(local); negative.actor.properties.gongxian = -1;
            add('local-family-negative', negative, [checkpoint(0, true)]);
            const weak = structuredClone(local); weak.actor.skills[lesson.skill]--;
            add('local-family-skill-low', weak, [checkpoint(0, false, replies.skill)]);
        }
        if (lesson.file === 'ada') {
            for (const [variant, master, rank, granted] of [
                ['master-ma', 'ma dayuan', 0, true],
                ['rank-exact', 'other teacher', 7, true],
                ['rank-low', 'other teacher', 6, false],
                ['master-other', 'other teacher', 0, false],
            ]) {
                const p = structuredClone(base);
                p.actor.properties['family/master_id'] = master;
                p.actor.properties['family/beggarlvl'] = rank;
                add(variant, p, [checkpoint(granted ? paid : 0, granted,
                    granted ? '' : '我什么时候说过要教你')]);
            }
        }
        // Qin's actual threshold and deduction differ (MA-020). Preserve the
        // resulting negative balance; do not repair it in the fixture.
        if (lesson.id === 'qin-kou') {
            for (const [variant, contribution] of [['cost-minus-one', 99], ['cost-exact', 100]]) {
                const p = structuredClone(base); p.actor.properties.gongxian = contribution;
                add(variant, p, [checkpoint(paid, true)]);
            }
        }
        const insufficient = structuredClone(base);
        insufficient.actor.properties.gongxian--;
        if (lesson.contribution_unchecked) {
            assert.equal(lesson.contribution, 0);
            assert.equal(paid, 0);
            assert.ok(!grant.fields, '公共教学不可绕过贡献门槛');
            add('contribution-negative', insufficient, [checkpoint(0, true)]);
        } else add('contribution-low', insufficient, [checkpoint(0, false,
            replies.contribution ?? (lesson.id === 'zhao-zhen' ? '教内甚无作为' : '作出的贡献不够'))]);

        const lowSkill = structuredClone(base);
        lowSkill.actor.skills[lesson.skill]--;
        add('skill-low', lowSkill, [checkpoint(0, false,
            replies.skill ?? (lesson.id === 'zhao-zhen' ? '还练得不到家' : '了解还不够'))]);
        if (lesson.shen !== 0 || lesson.shen_required) {
            const badShen = structuredClone(base);
            badShen.actor.properties.shen += lesson.shen < 0 ? 1 : -1;
            add(lesson.shen < 0 ? 'shen-high' : 'shen-low', badShen,
                [checkpoint(0, false, replies.shen ?? (lesson.shen < 0 ? '心慈手软' : '侠义正事不够'))]);
        }
        for (const [index, shen] of (lesson.accepted_shen ?? []).entries()) {
            const p = structuredClone(base); p.actor.properties.shen = shen;
            add(`shen-accepted-${index + 1}`, p, [checkpoint(paid, true)]);
        }
        if (lesson.free && lesson.shen === 0) {
            for (const [variant, value] of [['shen-negative', -100000], ['shen-positive', 100000]]) {
                const p = structuredClone(base); p.actor.properties.shen = value;
                add(variant, p, [checkpoint(paid, true)]);
            }
        }
        for (const requirement of lesson.secondary_skills ?? []) {
            const low = structuredClone(base); low.actor.skills[requirement.skill]--;
            add(`required-${requirement.skill}-low`, low, [checkpoint(0, false, '了解还不够')]);
        }
        for (const requirement of lesson.required_skills ?? []) {
            const low = structuredClone(base); low.actor.skills[requirement.skill]--;
            add(`${requirement.skill}-low`, low, [checkpoint(0, false, requirement.response)]);
        }

        if (lesson.basic_force) {
            const lowBasicForce = structuredClone(base);
            lowBasicForce.actor.skills.force--;
            add('basic-force-low', lowBasicForce, [checkpoint(0, false, replies.basic_force ?? '了解还不够')]);
        }
        if (lesson.max_neili) {
            const lowNeili = structuredClone(base);
            lowNeili.actor.properties.max_neili--;
            add('max-neili-low', lowNeili, [checkpoint(0, false, replies.max_neili ?? '内力修为不足')]);
        }
        if (lesson.dodge) {
            const lowDodge = structuredClone(base);
            lowDodge.actor.skills.dodge--;
            add('dodge-low', lowDodge, [checkpoint(0, false, replies.dodge)]);
        }
        if (lesson.basic_dodge) {
            const lowDodge = structuredClone(base);
            lowDodge.actor.skills.dodge--;
            add('basic-dodge-low', lowDodge, [checkpoint(0, false, replies.basic_dodge)]);
        }
        if (lesson.dex !== undefined) {
            const lowDex = structuredClone(base);
            lowDex.actor.properties.dex--;
            add('dex-low', lowDex, [checkpoint(0, false, replies.dex)]);
        }

        if (lesson.id !== 'zhao-zhen') {
            const differentFamily = structuredClone(base);
            differentFamily.actor.properties['family/family_name'] = lesson.other_family
                ?? (lesson.family === '武当派' ? '华山派' : '武当派');
            add('family-other', differentFamily, [lesson.free || lesson.family_unrestricted ? checkpoint(paid, true)
                : checkpoint(0, false, replies.family ?? '素无渊源')]);
            if (lesson.force > 0) {
                const lowForce = structuredClone(base);
                // When raw and effective force both have thresholds, lower
                // the mapped skill to isolate the latter without failing sk2.
                lowForce.actor.skills[lesson.mappings?.force ?? 'force']--;
                add('force-low', lowForce, [checkpoint(0, false, replies.force ?? '内功火候不足')]);
            }
        }

        if (lesson.id === 'zhao-zhen') {
            for (const [variant, property, value, message] of [
                ['family-other', 'family/family_name', '武当派', '不是我日月神教'],
                ['master-other', 'family/master_id', 'dongfang bubai', '先去向教主好好学艺'],
                ['strength-low', 'str', 31, '先天膂力不足'],
            ]) {
                const p = structuredClone(base); p.actor.properties[property] = value;
                add(variant, p, [checkpoint(0, false, message)]);
            }
            const p = structuredClone(base); p.actor.skills.force = 599;
            add('force-low', p, [checkpoint(0, false, '内功火候尚需提高')]);
        }
    }
    return [...result, ...lingxiaoSwordConditions(relations, result),
        ...honghuaSwordConditions(relations, result), ...gaibangStaffConditions(relations, result),
        ...quanzhenForceConditions(relations, result), ...kunlunSwordConditions(relations, result),
        ...diagramConditions(relations, sources), ...damoSwordConditions(relations, sources),
        ...renPalmConditions(relations, sources), ...learningPermissionConditions(relations, sources),
        ...bookTeachingConditions(relations, sources, readSource),
        ...hongLearningConditions(relations, catalog, sources, readSource),
        ...chenLearningConditions(relations, catalog, sources, readSource),
        ...meizhuangIntroductionConditions(relations, catalog, sources),
        ...shangLetterConditions(relations, catalog, sources, readSource),
        ...fengTeachingConditions(relations, catalog, readSource),
        ...quanzhenLearningConditions(relations, catalog, readSource),
        ...wudangTeachingConditions(relations, catalog, readSource),
        ...shaolinTeachingConditions(relations, catalog, readSource),
        ...shaolinTeachersConditions(relations, catalog, readSource),
        ...shaolinRecruitConditions(relations, readSource),
        ...shaolinPromotionConditions(relations, readSource),
        ...shaolinTonsureConditions(relations, readSource),
        ...shaolinFormationConditions(relations, readSource),
        ...shaolinChallengeConditions(relations, readSource),
        ...shaolinChallengeFailureConditions(relations, readSource),
        ...emeiTeachersConditions(relations, catalog, readSource),
        ...emeiRecruitConditions(relations, readSource),
        ...emeiSpecialConditions(relations, catalog, readSource),
        ...emeiTonsureConditions(relations, readSource),
        ...gumuTeachersConditions(relations, catalog, readSource),
        ...gumuSpecialTeachingConditions(relations, catalog, readSource),
        ...gumuAcquisitionLearningConditions(relations, catalog, readSource),
        ...gumuItemAcquisitionConditions(relations, catalog, readSource),
        ...gumuRecruitConditions(relations, catalog, readSource)];
}

// Acquire the prerequisite through the original NPC and retain its reward.
function lingxiaoSwordConditions(relations, configured) {
    const original = configured.find(c => c.id === 'teaching-shiqing-zhuo-grant').parameters;
    const path = 'kungfu/class/lingxiao/shiqing.c';
    const grant = relations.objects.find(o => o.path === path).grants
        .find(g => g.grant === 'can_perform/shangqing-jian/qing');
    assert.equal(grant.function, 'ask_skill2');
    assert.equal(grant.role, 'player_grant_candidate');
    assert.equal(grant.enclosing_function.path, path);
    assert.equal(grant.enclosing_function.sha256, reviewed[path]);
    const entry = { id: `${path}:${grant.enclosing_function.line}:ask_skill2`, path,
        sha256: reviewed[path], role: 'teaching', function: 'ask_skill2', line: grant.enclosing_function.line };
    const base = structuredClone(original);
    base.actor.skills = { 'shangqing-jian': 159, force: 440 };
    Object.assign(base.actor.properties, { gongxian: 2400, shen: 30000 });
    base.monitored_grants.push(grant.grant);
    base.note = '从零领悟经浊流剑→清流剑连续询问；前招扣贡献 800 并提高剑法一级，后招扣 1600。保留原奖励，不注入前置领悟；不代表已拜师或能施展。';
    const result = [];
    const add = (variant, p, { first = true, repeat = false, refusal = '' } = {}) => {
        delete p.teaching_expectations; delete p.expected;
        const initial = p.actor.skills['shangqing-jian'];
        const steps = first ? [{ action: original.action, teaching_entry: original.teaching_entry,
            grant: original.monitored_grants[0], value: 1, contribution_spent: 800,
            skills_before: { 'shangqing-jian': initial }, skills_after: { 'shangqing-jian': initial + 1 } }] : [];
        const before = initial + (first ? 1 : 0), after = before + (refusal ? 0 : 1);
        const last = { action: 'ask shi qing about 清流剑', teaching_entry: entry,
            grant: grant.grant, value: refusal ? 0 : 1, contribution_spent: refusal ? 0 : 1600,
            skills_before: { 'shangqing-jian': before }, skills_after: { 'shangqing-jian': after },
            ...(refusal ? { response_contains: refusal } : {}) };
        steps.push(last);
        if (repeat) steps.push({ ...last, contribution_spent: 0, skills_before: { 'shangqing-jian': after } });
        if (!first) Object.assign(p, { topic: '清流剑', action: last.action,
            teaching_entry: entry, teaching_evidence: grant.evidence });
        result.push({ id: `teaching-shiqing-qing-${variant}`, stage: 'school', method: 'teaching',
            entry_id: p.teaching_entry.id, samples: 2, status: 'configured_not_executed',
            parameters: { ...p, expected: steps.some(s => s.value > 0) ? 'observed' : 'refused',
                teaching_expectations: steps } });
    };
    add('complete', structuredClone(base));
    add('repeat', structuredClone(base), { repeat: true });
    const low = structuredClone(base); low.actor.skills['shangqing-jian'] = 158;
    add('skill-low', low, { refusal: '尚未修炼得精深' });
    const weak = structuredClone(base); weak.actor.skills.force--;
    add('force-low', weak, { refusal: '内功修行太浅' });
    for (const [variant, field, value, refusal] of [
        ['contribution-low', 'gongxian', 2399, '地位还不足'],
        ['shen-low', 'shen', 29999, '侠义正事做得不够'],
    ]) {
        const p = structuredClone(base); p.actor.properties[field] = value;
        add(variant, p, { refusal });
    }
    const other = structuredClone(base); other.actor.properties['family/family_name'] = '武当派';
    add('family-other', other, { first: false, refusal: '素无渊源' });
    const missing = structuredClone(base); missing.actor.skills['shangqing-jian'] = 160;
    add('missing-zhuo', missing, { first: false, refusal: '欲练清流剑必先通晓浊流剑诀' });
    return result;
}

// Acquire zhui first through the original NPC. Its reward raises the sword
// level; preserve that increment when testing zhu, never inject the grant.
function honghuaSwordConditions(relations, configured) {
    const original = configured.find(c => c.id === 'teaching-wuchen-zhui-grant').parameters;
    const path = 'kungfu/class/honghua/wuchen.c';
    const grant = relations.objects.find(o => o.path === path).grants
        .find(g => g.grant === 'can_perform/zhuihun-jian/zhu');
    assert.equal(grant.function, 'ask_skill3');
    assert.equal(grant.role, 'player_grant_candidate');
    assert.equal(grant.enclosing_function.path, path);
    assert.equal(grant.enclosing_function.sha256, reviewed[path]);
    const entry = { id: `${path}:${grant.enclosing_function.line}:ask_skill3`, path,
        sha256: reviewed[path], role: 'teaching', function: 'ask_skill3', line: grant.enclosing_function.line };
    const base = structuredClone(original);
    base.actor.skills = { 'zhuihun-jian': 159, force: 400 };
    Object.assign(base.actor.properties, { gongxian: 1500, shen: 80000, max_neili: 1800, neili: 1800 });
    base.monitored_grants.push(grant.grant);
    base.note = '从零领悟经追魂夺命→诛天刹神连续询问；前招扣贡献 300 并提高剑法一级，后招扣 1200。原奖励保留，不注入标记或重置等级；成功传授不证明已施展。';
    const result = [];
    const add = (variant, p, { first = true, repeat = false, refusal = '' } = {}) => {
        delete p.teaching_expectations; delete p.expected;
        const initial = p.actor.skills['zhuihun-jian'];
        const steps = first ? [{ action: original.action, teaching_entry: original.teaching_entry,
            grant: original.monitored_grants[0], value: 1, contribution_spent: 300,
            skills_before: { 'zhuihun-jian': initial }, skills_after: { 'zhuihun-jian': initial + 1 } }] : [];
        const before = initial + (first ? 1 : 0), after = before + (refusal ? 0 : 1);
        const last = { action: 'ask wuchen daozhang about 诛天刹神', teaching_entry: entry,
            grant: grant.grant, value: refusal ? 0 : 1, contribution_spent: refusal ? 0 : 1200,
            skills_before: { 'zhuihun-jian': before }, skills_after: { 'zhuihun-jian': after },
            ...(refusal ? { response_contains: refusal } : {}) };
        steps.push(last);
        if (repeat) steps.push({ ...last, contribution_spent: 0, skills_before: { 'zhuihun-jian': after } });
        if (!first) Object.assign(p, { topic: '诛天刹神', action: last.action,
            teaching_entry: entry, teaching_evidence: grant.evidence });
        result.push({ id: `teaching-wuchen-zhu-${variant}`, stage: 'school', method: 'teaching',
            entry_id: p.teaching_entry.id, samples: 2, status: 'configured_not_executed',
            parameters: { ...p, expected: steps.some(s => s.value > 0) ? 'observed' : 'refused',
                teaching_expectations: steps } });
    };
    add('complete', structuredClone(base));
    add('repeat', structuredClone(base), { repeat: true });
    const low = structuredClone(base); low.actor.skills['zhuihun-jian'] = 158;
    add('skill-low', low, { refusal: '还练得不到家' });
    const weak = structuredClone(base); weak.actor.skills.force--;
    add('force-low', weak, { refusal: '内功火候不足' });
    for (const [variant, field, value, refusal] of [
        ['contribution-low', 'gongxian', 1499, '贡献还不够'],
        ['shen-low', 'shen', 79999, '侠义正事做得不够'],
        ['max-neili-low', 'max_neili', 1799, '内力修为不够'],
    ]) {
        const p = structuredClone(base); p.actor.properties[field] = value;
        add(variant, p, { refusal });
    }
    const other = structuredClone(base); other.actor.properties['family/family_name'] = '武当派';
    add('family-other', other, { first: false, refusal: '和本会素无瓜葛' });
    add('missing-zhui', structuredClone(base), { first: false, refusal: '等你通晓那招后再来' });
    return result;
}

// The four prerequisite flags are acquired by their original inquiries on the
// same player. No rank advancement or ordinary learning is implied by this test.
function gaibangStaffConditions(relations, ordinary) {
    const path = 'kungfu/class/gaibang/hong.c';
    const teacher = relations.objects.find(o => o.path === path);
    const key = suffix => `can_perform/dagou-bang/${suffix}`;
    const prior = ['chan', 'chuo', 'feng', 'ban'];
    const templates = Object.fromEntries(prior.map(suffix => [suffix,
        ordinary.find(c => c.id === `teaching-hongqigong-${suffix}-grant`).parameters]));
    const grant = teacher.grants.find(g => g.grant === key('tian'));
    assert.equal(grant.function, 'ask_skill7');
    assert.equal(grant.role, 'player_grant_candidate');
    assert.equal(grant.enclosing_function.path, path);
    assert.equal(grant.enclosing_function.sha256, reviewed[path]);
    const entry = { id: `${path}:${grant.enclosing_function.line}:ask_skill7`,
        path, sha256: reviewed[path], function: 'ask_skill7', line: grant.enclosing_function.line, role: 'teaching' };
    const base = structuredClone(templates.chan);
    base.actor.skills = { 'dagou-bang': 216, force: 600 };
    base.actor.properties.gongxian = 6200;
    base.actor.properties.shen = 100000;
    base.actor.properties['family/beggarlvl'] = 9;
    base.monitored_grants = [...prior, 'tian'].map(key);
    base.note = '四诀经原询问取得，再询问天下无狗；准备九袋只作为传招门槛，不声称完成升袋任务。逐步核对奖励造成的等级变化、贡献余额与重复询问，不预写领悟。';
    const result = [];
    const add = (variant, order, p, refusals = {}) => {
        const known = new Set();
        let level = p.actor.skills['dagou-bang'];
        const steps = order.map(suffix => {
            const t = suffix === 'tian' ? { topic: '天下无狗', action: 'ask hong qigong about 天下无狗',
                teaching_entry: entry, teaching_evidence: grant.evidence } : templates[suffix];
            const before = level, repeat = known.has(suffix), reason = refusals[suffix];
            const acquired = !repeat && !reason;
            if (acquired) { known.add(suffix); level += suffix === 'tian' ? 3 : 1; }
            return { grant: key(suffix), value: known.has(suffix) ? 1 : 0,
                action: t.action, teaching_entry: t.teaching_entry,
                contribution_spent: acquired ? (suffix === 'tian' ? 2000
                    : templates[suffix].teaching_expectations[0].contribution_spent) : 0,
                skills_before: { 'dagou-bang': before }, skills_after: { 'dagou-bang': level },
                ...(reason ? { response_contains: reason } : {}) };
        });
        const first = order[0] === 'tian' ? { topic: '天下无狗', action: 'ask hong qigong about 天下无狗',
            teaching_entry: entry, teaching_evidence: grant.evidence } : templates[order[0]];
        result.push({ id: `teaching-hongqigong-tian-${variant}`, stage: 'school', method: 'teaching',
            entry_id: first.teaching_entry.id, samples: 2, status: 'configured_not_executed',
            parameters: { ...p, topic: first.topic, action: first.action,
                teaching_entry: first.teaching_entry, teaching_evidence: first.teaching_evidence,
                expected: steps.some(s => s.value > 0) ? 'observed' : 'refused', teaching_expectations: steps } });
    };
    const order = [...prior, 'tian'];
    add('complete', order, structuredClone(base));
    add('repeat', [...order, 'tian'], structuredClone(base));
    add('reverse', [...prior].reverse().concat('tian'), structuredClone(base));
    for (const missing of ['all', ...prior]) {
        const p = structuredClone(base); p.actor.skills['dagou-bang'] = 220;
        add('missing-' + missing, [...prior.filter(s => missing !== 'all' && s !== missing), 'tian'], p,
            { tian: '四个棒诀都了解透彻了么' });
    }
    for (const [variant, property, value, reason] of [
        ['rank-low', 'family/beggarlvl', 8, '帮中的辈分还不够'],
        ['contribution-low', 'gongxian', 6199, '帮中无所作为'],
    ]) {
        const p = structuredClone(base); p.actor.properties[property] = value;
        add(variant, order, p, { tian: reason });
    }
    const force = structuredClone(base); force.actor.skills.force = 599;
    add('force-low', order, force, { tian: '内功火候不足' });
    const skill = structuredClone(base); skill.actor.skills['dagou-bang'] = 215;
    add('skill-low', order, skill, { tian: '打狗棒法火候未到' });
    const shen = structuredClone(base); shen.actor.properties.shen = 99999;
    add('shen-low', order, shen, { ban: '侠义之事做得不够', tian: '侠义之事做得不够' });
    const family = structuredClone(base); family.actor.properties['family/family_name'] = '武当派';
    add('family-other', ['tian'], family, { tian: '什么时候说过要教你' });
    return result;
}

function bookTeachingConditions(relations, sources, readSource) {
    // Old frozen relationship inventories did not collect learning permissions.
    // Preserve their original condition set rather than inventing new coverage.
    const bookTeachers = ['huang', 'mei'].map(name =>
        relations.objects.find(o => o.path === `kungfu/class/taohua/${name}.c`));
    if (bookTeachers.every(teacher => teacher?.learning_permissions === undefined)) return [];
    assert.ok(bookTeachers.every(teacher => Array.isArray(teacher?.learning_permissions)),
        '交书许可来源不完整，须重新核对');
    const extra = Object.entries(bookSources).map(([path, hash]) => {
        assert.equal(sha256(readSource(path)), hash, '交书来源变化，须重新核对：' + path);
        return { path, sha256: hash };
    });
    const result = [], lessons = [
        { id: 'zhi', file: 'huang', npc: 'huang yaoshi', topic: '九阴神指', function: 'ask_zhi',
            level: 250, basic: 'finger', basic_level: 200, force: 240, max_neili: 5000, basic_reply: '基本指法不够娴熟' },
        { id: 'shou', file: 'huang', npc: 'huang yaoshi', topic: '九阴神手', function: 'ask_shou',
            level: 260, basic: 'hand', basic_level: 200, force: 240, max_neili: 5000, basic_reply: '基本手法不够娴熟' },
        { id: 'zhang', file: 'huang', npc: 'huang yaoshi', topic: '九阴神掌', function: 'ask_zhang',
            level: 260, basic: 'strike', basic_level: 220, force: 240, max_neili: 5000, basic_reply: '基本掌法不够娴熟' },
        { id: 'zhua', file: 'mei', npc: 'mei chaofeng', topic: '九阴神爪', function: 'ask_skill',
            level: 240, basic: 'claw', basic_level: 240, force: 260, max_neili: 5500, basic_reply: '基本爪法不够娴熟' },
    ];
    for (const lesson of lessons) {
        const path = `kungfu/class/taohua/${lesson.file}.c`;
        const teacher = relations.objects.find(o => o.path === path);
        assert.equal(teacher.sha256, reviewed[path]);
        const key = `can_perform/jiuyin-shengong/${lesson.id}`;
        const permission = `can_learn/jiuyin-shengong/${lesson.id}`;
        const grant = teacher.grants.find(g => g.grant === key);
        assert.equal(grant.function, lesson.function);
        const permits = teacher.learning_permissions.filter(p => p.function === 'accept_object');
        const expectedPermits = (lesson.file === 'huang' ? ['zhi', 'zhang', 'shou'] : ['zhua'])
            .map(suffix => 'can_learn/jiuyin-shengong/' + suffix);
        assert.deepEqual(permits.map(p => p.permission).sort(), [...expectedPermits].sort());
        const entry = declaration => {
            const fn = declaration.enclosing_function;
            assert.equal(fn.path, path); assert.equal(fn.sha256, reviewed[path]);
            return { id: `${path}:${fn.line}:${declaration.function}`, path, sha256: reviewed[path],
                function: declaration.function, line: fn.line, role: 'teaching' };
        };
        const askEntry = entry(grant), giveEntry = entry(permits[0]);
        const evidence = [...sources.filter(s => s.path === path || !s.path.startsWith('kungfu/class/')), ...extra];
        const base = {
            teacher: { path: '/' + path.slice(0, -2), id: lesson.npc, sha256: reviewed[path] },
            topic: lesson.topic, action: `ask ${lesson.npc} about ${lesson.topic}`, teaching_kind: 'book_teaching',
            actor: { skills: { 'jiuyin-shengong': lesson.level, [lesson.basic]: lesson.basic_level,
                force: lesson.force, 'martial-cognize': 240 }, mappings: {},
                properties: { 'family/family_name': '桃花岛', gongxian: 0, combat_exp: 10000000,
                    shen: 0, str: 30, max_neili: lesson.max_neili, neili: lesson.max_neili } },
            teaching_entry: askEntry, teaching_evidence: grant.evidence,
            qualification_sources: evidence.map(s => s.path), qualification_evidence: evidence,
            target: { skills: { force: 1 }, mappings: {}, properties: {} },
            fighting: false, observe_seconds: 0, not_applicable: '', known_issue: null,
            monitored_grants: [key, ...expectedPermits],
            note: '隔离准备原唯一秘籍，经原 give 换许可后 ask；不预写标记，不改书或教师。交书成功但授课被拒仍是部分进展，不等于学会。物品取得、秘籍研读和武学施展不属于这条链的完成范围。',
        };
        const ask = (value, reason = '') => ({ grant: key, value, contribution_spent: 0,
            ...(reason ? { response_contains: reason } : {}) });
        const give = (correct = true) => {
            const upper = (lesson.file === 'huang') === correct;
            const book = '/clone/lonely/book/zhenjing' + (upper ? 1 : 2);
            const id = 'zhenjing ' + (upper ? 'shangce' : 'xiace');
            return { action: `give ${id} to ${lesson.npc}`, teaching_entry: giveEntry,
                offer: { path: book, id, consumed: correct }, grant: permission, value: correct ? 1 : 0,
                grants_after: Object.fromEntries(expectedPermits.map(p => [p, correct ? 1 : 0])),
                contribution_spent: 0, may_improve_skills: false };
        };
        const add = (variant, p, steps) => result.push({ id: `teaching-jiuyin-${lesson.id}-${variant}`,
            stage: 'school', method: 'teaching', entry_id: askEntry.id, samples: 2,
            status: 'configured_not_executed', parameters: { ...p,
                expected: steps.some(s => s.value) ? 'observed' : 'refused', teaching_expectations: steps } });
        add('complete', structuredClone(base), [give(), ask(1)]);
        add('repeat', structuredClone(base), [give(), ask(1), ask(1, '你不是已经会了吗')]);
        add('repeat-book', structuredClone(base), [give(), give(), ask(1)]);
        const missing = lesson.file === 'huang' ? '我与阁下毫无瓜葛' : '九阴真经下册';
        add('missing-book', structuredClone(base), [ask(0, missing)]);
        add('wrong-book', structuredClone(base), [give(false), ask(0, missing)]);
        const other = structuredClone(base); other.actor.properties['family/family_name'] = '武当派';
        add('family-other', other, [give(), ask(1)]);
        for (const [variant, field, reason] of [
            ['skill-low', 'jiuyin-shengong', '九阴神功火候不够'],
            ['basic-low', lesson.basic, lesson.basic_reply],
            ['force-low', 'force', '内功修为不够'],
            ['cognize-low', 'martial-cognize', '武学修养不够'],
        ]) {
            const low = structuredClone(base); low.actor.skills[field]--;
            add(variant, low, [give(), ask(0, reason)]);
        }
        const lowNeili = structuredClone(base); lowNeili.actor.properties.max_neili--;
        add('max-neili-low', lowNeili, [give(), ask(0, '内力修为不足')]);
    }
    // One upper volume grants all three permissions. Observe the actual
    // successive rewards without giving a second book or resetting levels.
    const all = structuredClone(result.find(c => c.id === 'teaching-jiuyin-zhi-complete'));
    all.id = 'teaching-jiuyin-upper-all';
    all.parameters.actor.skills['jiuyin-shengong'] = 260;
    Object.assign(all.parameters.actor.skills, { hand: 200, strike: 220 });
    for (const suffix of ['shou', 'zhang']) {
        const next = result.find(c => c.id === `teaching-jiuyin-${suffix}-complete`).parameters;
        all.parameters.monitored_grants.push(next.monitored_grants[0]);
        all.parameters.teaching_expectations.push({ ...next.teaching_expectations[1],
            action: next.action, teaching_entry: next.teaching_entry });
    }
    result.push(all);
    return result;
}

// Follow the original prerequisite teaching. Its three improvement calls stay
// observable; do not reset skills or inject fen before asking for dang.
function quanzhenForceConditions(relations, configured) {
    const original = configured.find(c => c.id === 'teaching-wangchongyang-fen-grant').parameters;
    const path = 'kungfu/class/quanzhen/wang.c';
    const grant = relations.objects.find(o => o.path === path).grants
        .find(g => g.grant === 'can_perform/xiantian-gong/dang');
    assert.equal(grant.function, 'ask_skill5');
    assert.equal(grant.role, 'player_grant_candidate');
    assert.equal(grant.enclosing_function.path, path);
    assert.equal(grant.enclosing_function.sha256, reviewed[path]);
    const entry = { id: `${path}:${grant.enclosing_function.line}:ask_skill5`, path,
        sha256: reviewed[path], role: 'teaching', function: 'ask_skill5', line: grant.enclosing_function.line };
    const base = structuredClone(original);
    Object.assign(base.actor.properties, { gongxian: 4500, shen: 150000, max_neili: 5000, neili: 5000 });
    base.monitored_grants.push(grant.grant);
    base.note = '从零领悟连续询问五阴焚灭→神威浩荡；前招原样扣 2000 贡献并三次提高先天功，后招扣 2500。保留所有奖励，不用回调后重置或注入标记制造 240 级边界。';
    const result = [];
    const add = (variant, p, { first = true, repeat = false, refusal = '' } = {}) => {
        delete p.teaching_expectations; delete p.expected;
        const steps = first ? [{ action: original.action, teaching_entry: original.teaching_entry,
            grant: original.monitored_grants[0], value: 1, contribution_spent: 2000,
            skills_before: { 'xiantian-gong': 240 }, skills_after: { 'xiantian-gong': 243 } }] : [];
        const before = first ? 243 : 240, after = before + (refusal ? 0 : 3);
        const last = { action: 'ask wang chongyang about 神威浩荡', teaching_entry: entry,
            grant: grant.grant, value: refusal ? 0 : 1, contribution_spent: refusal ? 0 : 2500,
            skills_before: { 'xiantian-gong': before }, skills_after: { 'xiantian-gong': after },
            ...(refusal ? { response_contains: refusal } : {}) };
        steps.push(last);
        if (repeat) steps.push({ ...last, contribution_spent: 0, skills_before: { 'xiantian-gong': after } });
        if (!first) Object.assign(p, { topic: '神威浩荡', action: last.action,
            teaching_entry: entry, teaching_evidence: grant.evidence });
        result.push({ id: `teaching-wangchongyang-dang-${variant}`, stage: 'school', method: 'teaching',
            entry_id: p.teaching_entry.id, samples: 2, status: 'configured_not_executed',
            parameters: { ...p, expected: steps.some(s => s.value > 0) ? 'observed' : 'refused',
                teaching_expectations: steps } });
    };
    add('complete', structuredClone(base));
    add('repeat', structuredClone(base), { repeat: true });
    for (const [variant, field, value, refusal] of [
        ['contribution-low', 'gongxian', 4499, '教内甚无作为'],
        ['shen-low', 'shen', 149999, '侠义正事还做得不够'],
        ['max-neili-low', 'max_neili', 4999, '内力修为仍不足'],
    ]) {
        const p = structuredClone(base); p.actor.properties[field] = value;
        add(variant, p, { refusal });
    }
    const other = structuredClone(base); other.actor.properties['family/family_name'] = '武当派';
    add('family-other', other, { first: false, refusal: '与贫道素不相识' });
    add('missing-fen', structuredClone(base), { first: false, refusal: '还是逐步学习' });
    return result;
}

function learningPermissionConditions(relations, sources) {
    const path = 'kungfu/class/wudu/hetieshou.c';
    const teacher = relations.objects.find(o => o.path === path);
    // Frozen older relation reports predate this separate index. Their own
    // original conditions remain verifiable without claiming new coverage.
    if (!teacher.learning_permissions) return [];
    const key = 'can_learn/qianzhu-wandushou';
    const permission = teacher.learning_permissions.find(p => p.permission === key);
    assert.equal(permission?.function, 'ask_skill6', '千蛛学习许可来源改变，须重新核对');
    assert.equal(permission.value.value, 1);
    assert.equal(permission.role, 'player_permission_candidate');
    assert.equal(permission.enclosing_function.sha256, reviewed[path]);
    const entry = { id: `${path}:${permission.enclosing_function.line}:ask_skill6`, path,
        sha256: reviewed[path], function: 'ask_skill6', line: permission.enclosing_function.line, role: 'teaching' };
    const evidence = sources.filter(s => s.path === path || s.path === 'kungfu/class/wudu/wudu.h'
        || !s.path.startsWith('kungfu/class/'));
    const base = {
        teacher: { path: '/kungfu/class/wudu/hetieshou', id: 'he tieshou', sha256: reviewed[path] },
        topic: '千蛛万毒手', action: 'ask he tieshou about 千蛛万毒手', teaching_kind: 'learning_permission',
        actor: { skills: { force: 0, 'martial-cognize': 0 }, mappings: {},
            properties: { 'family/family_name': '五毒教', gongxian: 0, combat_exp: 1000000,
                score: 100000, shen: -200000, str: 30 } },
        teaching_evidence: permission.evidence, teaching_entry: entry,
        qualification_sources: evidence.map(s => s.path), qualification_evidence: evidence,
        unchanged_properties: ['combat_exp', 'score'],
        target: { skills: { force: 1 }, mappings: {}, properties: {} },
        fighting: false, observe_seconds: 0, not_applicable: '',
        monitored_grants: [key], known_issue: null,
        note: '询问只授予学习许可并奖励武学修养，不直接教授千蛛万毒手。门派检查已注释，按实际行为采集外派许可；没有贡献门槛或扣费。密室寻书与研读是独立入口，不算本询问已完成学习。',
    };
    const step = (value, improves = false, reason = '') => ({ grant: key, value,
        contribution_spent: 0, may_improve_skills: improves,
        absent_skills: ['qianzhu-wandushou'],
        ...(improves ? { skills_before: { 'martial-cognize': 0 },
            skills_after: { 'martial-cognize': 1 }, learned_after: { 'martial-cognize': 0 } } : {}),
        ...(reason ? { response_contains: reason } : {}) });
    const result = [];
    const add = (variant, parameters, expectations) => result.push({
        id: `teaching-hetieshou-permission-${variant}`, stage: 'school', method: 'teaching',
        entry_id: entry.id, samples: 2, status: 'configured_not_executed', parameters: {
            ...parameters, expected: expectations.some(e => e.value) ? 'observed' : 'refused',
            teaching_expectations: expectations },
    });
    add('grant', structuredClone(base), [step(1, true)]);
    add('repeat', structuredClone(base), [step(1, true), step(1, false, '已经告诉过你')]);
    for (const [variant, field, value, reason] of [
        ['experience-low', 'combat_exp', 999999, '经验太浅'],
        ['score-low', 'score', 99999, '江湖阅历还不够'],
        ['shen-high', 'shen', -199999, '心慈手软'],
    ]) {
        const p = structuredClone(base); p.actor.properties[field] = value;
        add(variant, p, [step(0, false, reason)]);
    }
    const other = structuredClone(base); other.actor.properties['family/family_name'] = '武当派';
    add('family-other', other, [step(1, true)]);
    return result;
}

// Acquire qian through the original teacher, then ask ni on the same player.
// The first reward changes the sword level; no flags or state resets intervene.
function kunlunSwordConditions(relations, configured) {
    const original = configured.find(c => c.id === 'teaching-hezudao-qian-grant').parameters;
    const path = 'kungfu/class/kunlun/hezudao.c';
    const grant = relations.objects.find(o => o.path === path).grants
        .find(g => g.grant === 'can_perform/qiankun-jian/ni');
    assert.equal(grant.function, 'ask_skill3');
    assert.equal(grant.role, 'player_grant_candidate');
    assert.equal(grant.enclosing_function.path, path);
    assert.equal(grant.enclosing_function.sha256, reviewed[path]);
    const entry = { id: `${path}:${grant.enclosing_function.line}:ask_skill3`, path,
        sha256: reviewed[path], role: 'teaching', function: 'ask_skill3', line: grant.enclosing_function.line };
    const base = structuredClone(original);
    base.actor.skills = { 'qiankun-jian': 180, force: 600 };
    base.actor.properties.gongxian = 2100;
    base.monitored_grants.push(grant.grant);
    base.note = '从零领悟经原乾坤劲→逆转乾坤连续询问；前招扣贡献 300 并提高乾坤神剑一级，后招条件按该实际状态核验，不注入或重置。';
    const result = [];
    const add = (variant, p, { first = true, repeat = false, refusal = '' } = {}) => {
        delete p.teaching_expectations; delete p.expected;
        const initial = p.actor.skills['qiankun-jian'];
        const steps = first ? [{ action: original.action, teaching_entry: original.teaching_entry,
            grant: original.monitored_grants[0], value: 1, contribution_spent: 300,
            skills_before: { 'qiankun-jian': initial }, skills_after: { 'qiankun-jian': initial + 1 } }] : [];
        const before = initial + (first ? 1 : 0), after = before + (refusal ? 0 : 1);
        const last = { action: 'ask he zudao about 逆转乾坤', teaching_entry: entry,
            grant: grant.grant, value: refusal ? 0 : 1, contribution_spent: refusal ? 0 : 1800,
            skills_before: { 'qiankun-jian': before }, skills_after: { 'qiankun-jian': after },
            ...(refusal ? { response_contains: refusal } : {}) };
        steps.push(last);
        if (repeat) steps.push({ ...last, contribution_spent: 0, skills_before: { 'qiankun-jian': after } });
        if (!first) Object.assign(p, { topic: '逆转乾坤', action: last.action,
            teaching_entry: entry, teaching_evidence: grant.evidence });
        result.push({ id: `teaching-hezudao-ni-${variant}`, stage: 'school', method: 'teaching',
            entry_id: p.teaching_entry.id, samples: 2, status: 'configured_not_executed',
            parameters: { ...p, expected: steps.some(s => s.value > 0) ? 'observed' : 'refused', teaching_expectations: steps } });
    };
    add('complete', structuredClone(base));
    add('repeat', structuredClone(base), { repeat: true });
    for (const [variant, level, refusal] of [['skill-exact', 179, ''], ['skill-low', 178, '修为还不够']]) {
        const p = structuredClone(base); p.actor.skills['qiankun-jian'] = level;
        add(variant, p, { refusal });
    }
    const poor = structuredClone(base); poor.actor.properties.gongxian = 2099;
    add('contribution-low', poor, { refusal: '作出的贡献不够' });
    const weak = structuredClone(base); weak.actor.skills.force = 599;
    add('force-low', weak, { refusal: '内功火候不足' });
    const other = structuredClone(base); other.actor.properties['family/family_name'] = '武当派';
    add('family-other', other, { first: false, refusal: '和本派素无瓜葛' });
    add('missing-qian', structuredClone(base), { first: false, refusal: '必须先通晓' });
    return result;
}

// The last palm needs two earlier real grants. The expectations below observe
// their rewards; they never inject flags or reset levels between questions.
function renPalmConditions(relations, sources) {
    const path = 'kungfu/class/riyue/ren.c';
    const teacher = relations.objects.find(o => o.path === path);
    const key = suffix => `can_perform/guzhuo-zhang/${suffix}`;
    const lessons = new Map([
        ['zhuo', { topic: '大巧若拙', function: 'ask_skill3', cost: 600, increases: 1 }],
        ['yu', { topic: '大智若愚', function: 'ask_skill4', cost: 1200, increases: 1 }],
        ['zhen', { topic: '反璞归真', function: 'ask_skill5', cost: 2200, increases: 3 }],
    ]);
    for (const [id, lesson] of lessons) {
        const grant = teacher.grants.find(g => g.grant === key(id));
        assert.equal(grant?.function, lesson.function, '任我行掌法教学来源改变');
        assert.equal(grant.role, 'player_grant_candidate');
        assert.equal(grant.enclosing_function.path, path);
        assert.equal(grant.enclosing_function.sha256, reviewed[path]);
        lesson.entry = { id: `${path}:${grant.enclosing_function.line}:${lesson.function}`,
            path, sha256: reviewed[path], role: 'teaching', function: lesson.function,
            line: grant.enclosing_function.line };
        lesson.evidence = grant.evidence;
    }
    const evidence = sources.filter(s => s.path === path || s.path === 'kungfu/class/riyue/riyue.h'
        || !s.path.startsWith('kungfu/class/'));
    const base = {
        teacher: { path: '/kungfu/class/riyue/ren', id: 'ren woxing', sha256: reviewed[path] },
        actor: { skills: { 'guzhuo-zhang': 220, force: 600, strike: 220, 'martial-cognize': 0 },
            mappings: {}, properties: { 'family/family_name': '日月神教', gongxian: 4000,
                shen: -200000, max_neili: 3600, neili: 3600, str: 30, combat_exp: 10000000 } },
        qualification_sources: evidence.map(s => s.path), qualification_evidence: evidence,
        target: { skills: { force: 1 }, mappings: {}, properties: {} },
        fighting: false, observe_seconds: 0, not_applicable: '',
        monitored_grants: ['zhuo', 'yu', 'zhen'].map(key), known_issue: null,
        note: '从零领悟开始走原授课链，连续保留贡献、技能奖励和状态。前两次各奖励一次掌法，最后一招原样奖励三次；有前置进展但最后拒绝不代表已学会反璞归真。技能边界观察第三问的真实等级，不重置奖励。',
    };
    const result = [];
    const add = (variant, order, p, refusal = '') => {
        const first = lessons.get(order[0]);
        const levels = { 'guzhuo-zhang': p.actor.skills['guzhuo-zhang'],
            strike: p.actor.skills.strike, 'martial-cognize': 0 };
        const obtained = new Set();
        const expectations = order.map(id => {
            const lesson = lessons.get(id), already = obtained.has(id);
            const denied = id === 'zhen' && Boolean(refusal);
            const before = { ...levels };
            if (!already && !denied) {
                obtained.add(id);
                // At these fixed levels/experience each original reward call
                // exceeds the next-level threshold but improve_skill uses if,
                // not while: one increase per call, not a synthetic reward.
                levels['guzhuo-zhang'] += lesson.increases;
                levels.strike += lesson.increases;
                levels['martial-cognize']++;
            }
            return { action: `ask ren woxing about ${lesson.topic}`, teaching_entry: lesson.entry,
                grant: key(id), value: obtained.has(id) ? 1 : 0,
                contribution_spent: already || denied ? 0 : lesson.cost,
                skills_before: before, skills_after: { ...levels },
                ...(!already && !denied ? { learned_after: {
                    'guzhuo-zhang': 0, strike: 0, 'martial-cognize': 0 } } : {}),
                ...(denied ? { response_contains: refusal } : {}) };
        });
        result.push({ id: `teaching-ren-zhen-${variant}`, stage: 'school', method: 'teaching',
            entry_id: first.entry.id, samples: 2, status: 'configured_not_executed', parameters: {
                ...p, topic: first.topic, action: `ask ren woxing about ${first.topic}`,
                teaching_entry: first.entry, teaching_evidence: first.evidence,
                expected: expectations.some(e => e.value > 0) ? 'observed' : 'refused',
                teaching_expectations: expectations } });
    };
    add('complete', ['zhuo', 'yu', 'zhen'], structuredClone(base));
    add('repeat', ['zhuo', 'yu', 'zhen', 'zhen'], structuredClone(base));
    add('reverse', ['yu', 'zhuo', 'zhen'], structuredClone(base));
    for (const [variant, order] of [
        ['missing-both', ['zhen']], ['missing-zhuo', ['yu', 'zhen']], ['missing-yu', ['zhuo', 'zhen']],
    ]) add(variant, order, structuredClone(base), '前两招都未练成');
    for (const [variant, property, value, reason] of [
        ['contribution-low', 'gongxian', 3999, '教内甚无作为'],
        ['shen-high', 'shen', -199999, '心慈手软'],
        ['max-neili-low', 'max_neili', 3599, '内力太差'],
    ]) {
        const p = structuredClone(base); p.actor.properties[property] = value;
        add(variant, ['zhuo', 'yu', 'zhen'], p, reason);
    }
    const forceLow = structuredClone(base); forceLow.actor.skills.force = 599;
    add('force-low', ['zhuo', 'yu', 'zhen'], forceLow, '内功火候尚需提高');
    for (const [variant, level, reason] of [
        ['skill-exact', 218, ''], ['skill-low', 217, '还练得不到家'],
    ]) {
        const p = structuredClone(base); p.actor.skills['guzhuo-zhang'] = level;
        add(variant, ['zhuo', 'yu', 'zhen'], p, reason);
    }
    const other = structuredClone(base); other.actor.properties['family/family_name'] = '武当派';
    add('family-other', ['zhen'], other, '不是我日月神教');
    return result;
}

// Private inquiries do not charge contribution and use the original
// is_apprentice_of(), including its current reborn-family fallback.
function damoSwordConditions(relations, sources) {
    const path = 'kungfu/class/shaolin/da-mo.c';
    const teacher = relations.objects.find(o => o.path === path);
    const evidence = sources.filter(s => s.path === path || s.path === 'kungfu/class/shaolin/shaolin.h'
        || !s.path.startsWith('kungfu/class/'));
    const key = suffix => `can_perform/damo-jian/${suffix}`;
    const lessons = [
        { id: 'qingxin', topic: '达摩清心剑', actual: 'luan', reward: 'force', issue: 'MA-017' },
        { id: 'luan', topic: '达摩乱气剑', actual: 'qingxin', reward: 'sword', issue: 'MA-017' },
        { id: 'shang', topic: '达摩伤神剑', actual: 'shang', reward: 'force' },
        { id: 'zhe', topic: '达摩折元剑', actual: 'zhe', reward: 'force' },
    ];
    const result = [], bases = new Map();
    for (const lesson of lessons) {
        const grant = teacher.grants.find(g => g.function === `ask_${lesson.id}`);
        assert.equal(grant?.grant, key(lesson.actual), '达摩私有教学写入改变，须重新核对');
        assert.equal(grant.role, 'player_grant_candidate');
        assert.equal(grant.enclosing_function.path, path);
        assert.equal(grant.enclosing_function.sha256, reviewed[path]);
        const entry = { id: `${path}:${grant.enclosing_function.line}:${grant.function}`,
            path, sha256: reviewed[path], function: grant.function,
            line: grant.enclosing_function.line, role: 'teaching' };
        const base = {
            teacher: { path: '/kungfu/class/shaolin/da-mo', id: 'da mo', sha256: reviewed[path] },
            topic: lesson.topic, action: `ask da mo about ${lesson.topic}`,
            actor: { skills: { 'damo-jian': 200, force: 100, sword: 100 }, mappings: {},
                properties: { 'family/family_name': '少林派', 'family/master_id': 'da mo',
                    'family/master_name': '达摩老祖', 'reborn/family_name': 0,
                    gongxian: 0, shen: 120000, str: 30, combat_exp: 10000000 } },
            teaching_evidence: grant.evidence, teaching_entry: entry,
            qualification_sources: evidence.map(s => s.path), qualification_evidence: evidence,
            target: { skills: { force: 1 }, mappings: {}, properties: {} },
            fighting: false, observe_seconds: 0, not_applicable: '',
            monitored_grants: lessons.map(l => key(l.id)), known_issue: lesson.issue ?? null,
            note: '原询问不扣贡献；原师承判定核对 ID、姓名及转世门派。保留 MA-017 的错误授予与顺序依赖，不注入领悟、不修正原询问；技能奖励与新领悟分开观察。',
        };
        const step = (granted, teaches = granted, reason = '') => ({ grant: key(lesson.actual),
            value: granted ? 1 : 0, contribution_spent: 0, may_improve_skills: teaches,
            ...(teaches ? { reward_skill: lesson.reward } : {}),
            ...(lesson.issue ? { absent_grants: [key(lesson.id)] } : {}),
            ...(reason ? { response_contains: reason } : {}),
        });
        const add = (variant, p, expectations) => result.push({
            id: `teaching-damo-${lesson.id}-${variant}`, stage: 'school', method: 'teaching',
            entry_id: entry.id, samples: 2, status: 'configured_not_executed',
            parameters: { ...p, expected: expectations.some(e => e.value > 0) ? 'observed' : 'refused',
                teaching_expectations: expectations },
        });
        add('grant', structuredClone(base), [step(true)]);
        add('repeat', structuredClone(base), [step(true), step(true, lesson.id === 'qingxin')]);
        for (const [variant, field, value, reason] of [
            ['family-other', 'family/family_name', '华山派', '并非我们少林弟子'],
            ['shen-low', 'shen', 119999, '不擅于此道'],
            ['master-other', 'family/master_id', 'other teacher', '非我弟子'],
            ['master-name-other', 'family/master_name', '另一位师父', '非我弟子'],
        ]) {
            const p = structuredClone(base); p.actor.properties[field] = value;
            add(variant, p, [step(false, false, reason)]);
        }
        const lowSkill = structuredClone(base); lowSkill.actor.skills['damo-jian']--;
        add('skill-low', lowSkill, [step(false, false, '达魔剑法还不到家')]);
        for (const [variant, family, granted] of [
            ['reborn-same', '少林派', true], ['reborn-other', '华山派', false],
        ]) {
            const p = structuredClone(base);
            p.actor.properties['family/master_id'] = 'other teacher';
            p.actor.properties['reborn/family_name'] = family;
            add(variant, p, [step(granted, granted, granted ? '' : '非我弟子')]);
        }
        bases.set(lesson.id, { base, entry, step });
    }
    // Both orders start with neither grant; the second command uses the same
    // student and teacher. Its grant check comes from the second original entry.
    for (const [first, second] of [['qingxin', 'luan'], ['luan', 'qingxin']]) {
        const a = bases.get(first), b = bases.get(second);
        const next = b.step(first === 'qingxin');
        delete next.absent_grants; // the first grant must now be preserved, not reset to zero
        next.action = b.base.action;
        next.teaching_entry = b.entry;
        result.push({ id: `teaching-damo-order-${first}-${second}`, stage: 'school', method: 'teaching',
            entry_id: a.entry.id, samples: 2, status: 'configured_not_executed',
            parameters: { ...structuredClone(a.base), expected: 'observed',
                teaching_expectations: [a.step(true), next] } });
    }
    return result;
}

// Taiji diagram advances ten times through the original inquiry closure.
// All sequences start unlearned; no flag is injected between questions.
function diagramConditions(relations, sources) {
    const path = 'kungfu/class/wudang/zhang.c', grantKey = 'can_perform/taiji-quan/tu';
    const teacher = relations.objects.find(o => o.path === path);
    const grant = teacher.grants.find(g => g.grant === grantKey && g.operation === 'add');
    assert.equal(grant?.function, 'ask_skill6', '太极图递进来源改变，须重新核对');
    assert.equal(grant.increment.value, 1);
    const entry = { id: `${path}:${grant.enclosing_function.line}:ask_skill6`, path,
        sha256: reviewed[path], function: 'ask_skill6', line: grant.enclosing_function.line, role: 'teaching' };
    const evidence = sources.filter(s => s.path === path || !s.path.startsWith('kungfu/class/'));
    const base = {
        teacher: { path: '/kungfu/class/wudang/zhang', id: 'zhang sanfeng', sha256: reviewed[path] },
        topic: '太极图', action: 'ask zhang sanfeng about 太极图',
        actor: { skills: { 'taiji-quan': 250, 'taiji-shengong': 300, taoism: 300, force: 0 },
            mappings: {}, properties: { 'family/family_name': '武当派',
                gongxian: 3000, shen: 250000, max_jingli: 1000,
                potential: 1200, learned_points: 200, str: 30, combat_exp: 10000000 } },
        teaching_evidence: grant.evidence, teaching_entry: entry,
        qualification_sources: evidence.map(s => s.path), qualification_evidence: evidence,
        target: { skills: { force: 1 }, mappings: {}, properties: {} },
        fighting: false, observe_seconds: 0, not_applicable: '',
        monitored_grants: [grantKey], grant_completion_value: 10, known_issue: null,
        note: '太极图每次增加一层、使用 100 潜能；第十层才扣贡献并奖励技能。首次递增不算全部学会，连续询问不重置或预写领悟。潜能不足提示由原 write 输出，状态观察不冒充完整客户端消息。',
    };
    const step = (value, learnedPoints = 100, reason = '') => ({ grant: grantKey, value,
        contribution_spent: value === 10 && learnedPoints > 0 ? 3000 : 0,
        learned_points_spent: learnedPoints, may_improve_skills: value === 10 && learnedPoints > 0,
        ...(reason ? { response_contains: reason } : {}) });
    const sequence = length => Array.from({ length }, (_, i) => step(i + 1));
    const result = [];
    const add = (variant, parameters, expectations) => result.push({
        id: `teaching-zhang-tu-${variant}`, stage: 'school', method: 'teaching', entry_id: entry.id,
        samples: 2, status: 'configured_not_executed',
        parameters: { ...parameters, expected: expectations.some(e => e.value > 0) ? 'observed' : 'refused',
            teaching_expectations: expectations },
    });
    add('first-step', structuredClone(base), sequence(1));
    add('complete', structuredClone(base), sequence(10));
    add('repeat', structuredClone(base), [...sequence(10), step(10, 0)]);
    const partial = structuredClone(base);
    partial.actor.properties.potential = 1100;
    add('potential-partial', partial, [...sequence(9), step(9, 0)]);
    for (const [variant, field, value, reason] of [
        ['contribution-low', 'gongxian', 2999, '效力还不够'],
        ['shen-low', 'shen', 249999, '行侠仗义'],
        ['max-jingli-low', 'max_jingli', 999, '精力不济'],
        ['family-other', 'family/family_name', '华山派', '不是我们武当派'],
        ['potential-low', 'potential', 299, ''],
    ]) {
        const p = structuredClone(base); p.actor.properties[field] = value;
        add(variant, p, [step(0, 0, reason)]);
    }
    for (const [variant, skill, reason] of [
        ['quan-low', 'taiji-quan', '太极拳法还不到家'],
        ['force-skill-low', 'taiji-shengong', '太极神功还不到家'],
        ['taoism-low', 'taoism', '道学心法研究的还不够明白'],
    ]) {
        const p = structuredClone(base); p.actor.skills[skill]--;
        add(variant, p, [step(0, 0, reason)]);
    }
    return result;
}

// Teacher entry points retain their own identity, including shared headers.
export function teachingEntries(conditions) {
    const entries = new Map();
    for (const condition of conditions) {
        assert.equal(condition.stage, 'school');
        assert.equal(condition.method, 'teaching');
        const primary = condition.parameters.teaching_entry;
        assert.equal(primary.id, condition.entry_id, '教学条件与入口身份不一致');
        const sequenceEntries = condition.parameters.teaching_expectations
            .filter(step => step.teaching_entry).map(step => step.teaching_entry);
        for (const entry of [primary, ...sequenceEntries]) {
            assert.equal(entry.role, 'teaching');
            assert.ok(entry.path.startsWith('kungfu/class/'), '教学入口不是教师来源');
            assert.ok(condition.parameters.qualification_evidence
                .some(s => s.path === entry.path && s.sha256 === entry.sha256), '教学入口缺少来源 hash');
            assert.equal(entry.id, `${entry.path}:${entry.line}:${entry.function}`, '教学入口身份字段不一致');
            if (entries.has(entry.id)) assert.deepEqual(entries.get(entry.id), entry, '重复入口的来源不一致');
            else entries.set(entry.id, structuredClone(entry));
        }
    }
    return [...entries.values()];
}
